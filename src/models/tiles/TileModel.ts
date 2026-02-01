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
    public pivotPoint: Point = new Point();
    public positionPoint: Point = new Point();
    public rotationAngle: number = 0;
    public currentRotationAngle: number = 0;
    public currentTargetRotationAngle: number = 0;
    public rotatingBoundingRectangleSize: Size = new Size();
    public absoluteBoundingRectangle: Rectangle = new Rectangle();
    public position: TilePosition = new TilePosition();
    private rotationController: SmoothRotationController | null = null;

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

    public getSamePositionNextAngleMinAngleDifference(): number {
        const freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();
        const normalizedNextRotationAngle = AdditionalMath.getNormalizedAngle(
            this.currentRotationAngle + freedomDegreeRotationAngle);
        return AdditionalMath.getMinAngleDifference(this.currentRotationAngle,
            normalizedNextRotationAngle);
    }

    public getNewPositionMinAngleDifference(normalizedTargetRotationAngle: number): number {
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

    public prepareToRotation(rotationAngleDifference: number): void {
        this.currentTargetRotationAngle = this.currentRotationAngle + rotationAngleDifference;
        if (!this.rotationController) {            
            this.rotationController = new SmoothRotationController(this.currentRotationAngle,
                this.currentTargetRotationAngle,
                TileModel.rotationTime,
                TileModel.rotationAccelerationTimeToTotalTimeRatio);
        } else {
            this.rotationController.reset(this.currentRotationAngle,
                this.currentTargetRotationAngle);
        }
    }

    public executeRotation(deltaTime: number): void {
        const rotationAngleIncrement: number = this.rotationController?.getIsCompleted()
            ? 0
            : (this.rotationController?.getRotationAngleIncrement(deltaTime) ?? 0);
        this.currentRotationAngle += rotationAngleIncrement;
    }

    public completeRotation(): void {
        this.currentRotationAngle = AdditionalMath.getNormalizedAngle(
            this.currentTargetRotationAngle);
    }
    
    public getRotaionIsCompleted(): boolean {
        return this.rotationController?.getIsCompleted() ?? false;
    }
}