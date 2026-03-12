import { Point } from "pixi.js";
import { ValueChangeResult } from "./ValueChangeResult.ts";
import { SmoothStepController } from "./SmoothStepController.ts";

/**
 * Класс, контролирующий плавное изменение точки с течением времени
 */
export class SmoothPointStepController extends SmoothStepController<Point> {
    public reset(newStartValue: Point, newTargetValue: Point): void {
        this.currentTime = 0;
        this.currentValue = newStartValue.clone();
        this.isCompleted = false;
        this.startValue = newStartValue.clone();
        this.targetValue = newTargetValue.clone();
    }
    
    public getIncrement(deltaTime: number): Point {
        if (this.isCompleted) {
            return new Point(0, 0);
        }
        
        const result = this.getChangeResult(deltaTime);        
        this.currentTime = result.newCurrentTime;
        this.currentValue.x += result.valueIncrement.x;
        this.currentValue.y += result.valueIncrement.y;
        this.isCompleted = result.valueChangeIsCompleted;
        
        return result.valueIncrement;
    }

    protected getChangeResult(deltaTime: number): ValueChangeResult<Point> {
        const totalPointDifference = new Point(this.targetValue.x - this.startValue.x,
            this.targetValue.y - this.startValue.y);
        
        const totalDistance = Math.sqrt(totalPointDifference.x * totalPointDifference.x + 
            totalPointDifference.y * totalPointDifference.y);
        
        if (totalDistance === 0) {
            return {
                valueIncrement: new Point(0, 0),
                newCurrentTime: Math.min(this.currentTime + deltaTime, this.totalTime),
                valueChangeIsCompleted: this.currentTime + deltaTime >= this.totalTime
            };
        }
        
        const direction = new Point(totalPointDifference.x / totalDistance,
            totalPointDifference.y / totalDistance);
        
        const accelerationTimeToTotalTimeRatio = Math.min(
            this.accelerationTimeToTotalTimeRatio, 0.5);
        let accelerationTime = this.totalTime * accelerationTimeToTotalTimeRatio;
        let decelerationTime = accelerationTime;
        let constantTime = this.totalTime - accelerationTime - decelerationTime;
        
        if (constantTime < 0) {
            const totalTimeHalf = this.totalTime / 2.0;
            accelerationTime = totalTimeHalf;
            decelerationTime = totalTimeHalf;
            constantTime = 0;
        }
        
        let maxSpeed: number;
        let acceleration: number;        
        if (constantTime > 0) {
            maxSpeed = totalDistance / (accelerationTime + constantTime);
            acceleration = maxSpeed / accelerationTime;
        } else {
            acceleration = 4 * totalDistance / (this.totalTime * this.totalTime);
            maxSpeed = acceleration * (this.totalTime / 2.0);
        }
        
        const newTime = Math.min(this.currentTime + deltaTime, this.totalTime);
        
        const currentTimeDistance = this.getDistanceAtTime(this.currentTime,
            accelerationTime, acceleration, constantTime);
        const newTimeDistance = this.getDistanceAtTime(newTime,
            accelerationTime, acceleration, constantTime);
        
        const distanceIncrement = newTimeDistance - currentTimeDistance;
        const valueIncrement = new Point(direction.x * distanceIncrement,
            direction.y * distanceIncrement);

        return {
            valueIncrement: valueIncrement,
            newCurrentTime: newTime,
            valueChangeIsCompleted: newTime >= this.totalTime
        };
    }

    public complete(): void {
        this.currentValue = this.targetValue.clone();
        this.isCompleted = true;
        this.currentTime = this.totalTime;
    }
}