import { ChangeResult } from "./ChangeResult";

export class SmoothValueChangeController {
    private startValue: number;
    private targetValue: number;
    private totalTime: number;
    private accelerationTimeToTotalTimeRatio: number;
    private currentTime: number = 0;
    private currentValue: number;
    private isCompleted: boolean = false;
    
    constructor(startValue: number,
        targetValue: number,
        totalTime: number,
        accelerationTimeToTotalTimeRatio: number = 0.3) {

        this.startValue = startValue;
        this.targetValue = targetValue;
        this.totalTime = totalTime;
        this.accelerationTimeToTotalTimeRatio = accelerationTimeToTotalTimeRatio;
        this.currentValue = startValue;
    }

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
        this.currentValue += result.increment;
        this.isCompleted = result.isCompleted;
        
        return result.increment;
    }

    private getChangeResult(deltaTime: number): ChangeResult<number> {
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
            increment: valueIncrement,
            newCurrentTime: newTime,
            isCompleted: newTime >= this.totalTime
        };
    }

    private getDistanceAtTime(time: number,
        accelerationTime: number,
        acceleration: number,
        constantTime: number): number {

        const clampedTime = Math.max(0, Math.min(time, this.totalTime));
        
        if (clampedTime <= accelerationTime) {
            return 0.5 * acceleration * clampedTime * clampedTime;
        }
        
        const accelerationDistance = 0.5 * acceleration * accelerationTime * accelerationTime;
        const maxVelocity = acceleration * accelerationTime;

        if (clampedTime <= accelerationTime + constantTime) {
            const constatntVeloсityTime = clampedTime - accelerationTime;
            return accelerationDistance + maxVelocity * constatntVeloсityTime;
        }
        
        const constatntVeloсityDistance = maxVelocity * constantTime;
        
        const decelerationTime = clampedTime - (accelerationTime + constantTime);
        const decelerationDistance = maxVelocity * decelerationTime
            - 0.5 * acceleration * decelerationTime * decelerationTime;
        
        return accelerationDistance + constatntVeloсityDistance + decelerationDistance;
    }
    
    public getIsCompleted(): boolean {
        return this.isCompleted;
    }
}