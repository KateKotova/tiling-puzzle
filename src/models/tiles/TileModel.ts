import { Point, Rectangle, Texture } from "pixi.js";
import { TilePosition } from "./TilePosition.ts";
import { TileType } from "./TileType.ts";
import { TileLockType } from "./TileLockType.ts";
import { TileTypeSvgData } from "./TileTypeSvgData.ts";
import { TileLockHeightToSideRatios } from "./TileLockHeightToSideRatios.ts";
import { Size } from "../geometry/Size.ts";
import { TileSvgData } from "./TileSvgData.ts";
import { AdditionalMath } from "../geometry/AdditionalMath.ts";
import { SmoothRotationController } from "../geometry/SmoothRotationController.ts";

export abstract class TileModel {
    private static readonly rotationAccelerationTimeToTotalTimeRatio: number = 0.3;
    private static readonly rotationTime: number = 300;
    public tileType: TileType = TileType.Unknown;
    public tileLockType: TileLockType = TileLockType.None;
    public texture: Texture | undefined;
    public centerPoint: Point = new Point();
    public rotationAngle: number = 0;
    public currentRotationAngle: number = 0;
    public rotatingBoundingRectangleSize: Size = new Size();
    public absoluteBoundingRectangle: Rectangle = new Rectangle();
    public position: TilePosition = new TilePosition();
    private rotationController: SmoothRotationController | null = null;
    public isRotating: boolean = false;

    public getSvgData(): TileSvgData | null {
        return TileTypeSvgData[this.tileType];
    }

    public getLockHeightToSideRatios(): number {
        return TileLockHeightToSideRatios[this.tileLockType];
    }

    public abstract getFreedomDegreeCount(): number;

    public getFreedomDegreeRotationAngle(): number {
        return 2 * Math.PI / this.getFreedomDegreeCount();
    }

    public getSameTargetNextAngleMinAngleDifference(): number {
        const freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();
        const normalizedNextRotationAngle = AdditionalMath.getNormalizedAngle(
            this.currentRotationAngle + freedomDegreeRotationAngle);
        return AdditionalMath.getMinAngleDifference(this.currentRotationAngle,
            normalizedNextRotationAngle);
    }

    public getNewTargetMinAngleDifference(normalizedTargetRotationAngle: number): number {
        const freedomDegreeCount = this.getFreedomDegreeCount();
        let result = AdditionalMath.getMinAngleDifference(this.currentRotationAngle,
            normalizedTargetRotationAngle);
        if (freedomDegreeCount == 1) {
            return result;
        }

        const freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();
        for (let freedomDegreeIndex = 1, potentialRotationAngle = normalizedTargetRotationAngle;
            freedomDegreeIndex < freedomDegreeCount;
            freedomDegreeIndex++, potentialRotationAngle += freedomDegreeRotationAngle) {

            const normalizedPotentialRotationAngle = AdditionalMath
                .getNormalizedAngle(potentialRotationAngle);
            const potentionalResult = AdditionalMath.getMinAngleDifference(
                this.currentRotationAngle, normalizedPotentialRotationAngle);
            if (Math.abs(potentionalResult) < Math.abs(result)) {
                result = potentionalResult;
            }
        }
        return result;
    }

    public prepareToRotation(angleDifference: number): void {
        if (this.isRotating) {
            return;
        }

        this.isRotating = true;
        if (!this.rotationController) {
            this.rotationController = new SmoothRotationController(this.currentRotationAngle,
                this.currentRotationAngle + angleDifference,
                TileModel.rotationTime,
                TileModel.rotationAccelerationTimeToTotalTimeRatio);
        } else {
            this.rotationController.reset(this.currentRotationAngle,
                this.currentRotationAngle + angleDifference);
        }
    }

    public completeRotation(angleDifference: number): void {
        if (!this.isRotating || !this.rotationController?.getIsCompleted()) {
            return;
        }
        
        this.currentRotationAngle = AdditionalMath.getNormalizedAngle(
            this.currentRotationAngle + angleDifference);
        this.isRotating = false;
    }
}