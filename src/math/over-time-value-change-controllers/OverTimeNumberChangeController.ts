import { OverTimeValueChangeController } from "./OverTimeValueChangeController.ts";
import { OverTimeValueChangeResult } from "./OverTimeValueChangeResult.ts";

/**
 * Класс, контролирующий плавное изменение числа с течением времени
 */
export class OverTimeNumberChangeController extends OverTimeValueChangeController<number>{
    public reset(newStartValue: number, newTargetValue: number): void {
        this.currentTime = 0;
        this.currentValue = newStartValue;
        this.isCompleted = false;
        this.startValue = newStartValue;
        this.targetValue = newTargetValue;
    }
    
    public getIncrement(deltaTime: number): number {
        if (this.isCompleted) {
            return 0;
        }
        
        const result = this.getChangeResult(deltaTime);        
        this.currentTime = result.newCurrentTime;
        this.currentValue += result.valueIncrement;
        this.isCompleted = result.valueChangeIsCompleted;
        
        return result.valueIncrement;
    }

    protected getChangeResult(deltaTime: number): OverTimeValueChangeResult<number> {
        const totalValueDifference = this.targetValue - this.startValue;        
        const direction = totalValueDifference >= 0 ? 1 : -1;
        const totalValueDistance = Math.abs(totalValueDifference);
        
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
            maxSpeed = totalValueDistance / (accelerationTime + constantTime);
            acceleration = maxSpeed / accelerationTime;
        } else {
            acceleration = 4 * totalValueDistance / (this.totalTime * this.totalTime);
            maxSpeed = acceleration * (this.totalTime / 2.0);
        }
        
        const newTime = Math.min(this.currentTime + deltaTime, this.totalTime);
        const currentTimeDistance = this.getDistanceAtTime(this.currentTime,
            accelerationTime, acceleration, constantTime);
        const newTimeDistance = this.getDistanceAtTime(newTime,
            accelerationTime, acceleration, constantTime);
        
        const valueIncrement = (newTimeDistance - currentTimeDistance) * direction;

        return {
            valueIncrement: valueIncrement,
            newCurrentTime: newTime,
            valueChangeIsCompleted: newTime >= this.totalTime
        };
    }

    public complete(): void {
        this.currentValue = this.targetValue;
        this.isCompleted = true;
        this.currentTime = this.totalTime;
    }
}