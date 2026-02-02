import { Point, Rectangle } from "pixi.js";
import { TilePosition } from "./TilePosition.ts";
import { TileType } from "./TileType.ts";
import { TileLockType } from "./TileLockType.ts";
import { TileTypeSvgData } from "./TileTypeSvgData.ts";
import { TileLockHeightToSideRatios } from "./TileLockHeightToSideRatios.ts";
import { Size } from "../math/Size.ts";
import { TileSvgData } from "./TileSvgData.ts";
import { AdditionalMath } from "../math/AdditionalMath.ts";
import { SmoothValueChangeController } from "../math/SmoothValueChangeController.ts";
import { SmoothPointChangeController } from "../math/SmoothPointChangeController.ts";
import { ModelSettings } from "../ModelSettings.ts";

export abstract class TileModel {
    protected modelSettings: ModelSettings;
    public tileType: TileType = TileType.Unknown;
    public tileLockType: TileLockType = TileLockType.None;
    public pivotPoint: Point = new Point(0, 0);
    public rotatingBoundingRectangleSize: Size = new Size();
    public absoluteBoundingRectangle: Rectangle = new Rectangle();
    public position: TilePosition = new TilePosition();

    public positionPoint: Point = new Point(0, 0);
    public currentPositionPoint: Point = new Point(0, 0);
    public currentTargetPositionPoint: Point = new Point(0, 0);
    protected positionPointController: SmoothPointChangeController | null = null;

    public rotationAngle: number = 0;
    public currentRotationAngle: number = 0;
    public currentTargetRotationAngle: number = 0;
    protected rotationController: SmoothValueChangeController | null = null;

    constructor(modelSettings: ModelSettings) {
        this.modelSettings = modelSettings;
    }

    public abstract clone(): TileModel;

    protected updateClone(clone: TileModel) {
        clone.modelSettings = this.modelSettings;
        clone.tileType = this.tileType;
        clone.pivotPoint = this.pivotPoint.clone();
        clone.rotatingBoundingRectangleSize = this.rotatingBoundingRectangleSize.clone();
        clone.absoluteBoundingRectangle = this.absoluteBoundingRectangle.clone();
        clone.position = this.position.clone();

        clone.positionPoint = this.positionPoint.clone();
        clone.currentPositionPoint = this.currentPositionPoint.clone();
        clone.currentTargetPositionPoint = this.currentTargetPositionPoint.clone();

        clone.rotationAngle = this.rotationAngle;
        clone.currentRotationAngle = this.currentRotationAngle;
        clone.currentTargetRotationAngle = this.currentTargetRotationAngle;
    }

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
            this.rotationController = new SmoothValueChangeController(this.currentRotationAngle,
                this.currentTargetRotationAngle,
                this.modelSettings.animationTime,
                this.modelSettings.animationAccelerationTimeToTotalTimeRatio);
        } else {
            this.rotationController.reset(this.currentRotationAngle,
                this.currentTargetRotationAngle);
        }
    }

    public prepareToMove(positionPointDifference: Point): void {
        this.currentTargetPositionPoint = new Point(
            this.currentPositionPoint.x + positionPointDifference.x,
            this.currentPositionPoint.y + positionPointDifference.y);
        if (!this.positionPointController) {            
            this.positionPointController = new SmoothPointChangeController(
                this.currentPositionPoint,
                this.currentTargetPositionPoint,
                this.modelSettings.animationTime,
                this.modelSettings.animationAccelerationTimeToTotalTimeRatio);
        } else {
            this.positionPointController.reset(this.currentPositionPoint,
                this.currentTargetPositionPoint);
        }
    }

    public executeRotation(deltaTime: number): void {
        const rotationAngleIncrement: number = this.rotationController?.getIsCompleted()
            ? 0
            : (this.rotationController?.getIncrement(deltaTime) ?? 0);
        this.currentRotationAngle += rotationAngleIncrement;
    }

    public executeMove(deltaTime: number): void {
        const positionPointIncrement: Point = this.positionPointController?.getIsCompleted()
            ? new Point(0, 0)
            : (this.positionPointController?.getIncrement(deltaTime) ?? new Point(0, 0));
        this.currentPositionPoint.x += positionPointIncrement.x;
        this.currentPositionPoint.y += positionPointIncrement.y;
    }

    public completeRotation(): void {
        this.currentRotationAngle = AdditionalMath.getNormalizedAngle(
            this.currentTargetRotationAngle);
    }

    public completeMove(): void {
        this.currentPositionPoint = this.currentTargetPositionPoint.clone();
    }
    
    public getRotaionIsCompleted(): boolean {
        return this.rotationController?.getIsCompleted() ?? false;
    }

    public getMoveIsCompleted(): boolean {
        return this.positionPointController?.getIsCompleted() ?? false;
    }
}