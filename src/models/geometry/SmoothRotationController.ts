import { RotationResult } from "./RotationResult";

export class SmoothRotationController {
    private startAngle: number;
    private targetAngle: number;
    private totalTime: number;
    private accelerationTimeToTotalTimeRatio: number;
    private currentTime: number = 0;
    private currentAngle: number;
    private isCompleted: boolean = false;
    
    constructor(startAngle: number,
        targetAngle: number,
        totalTime: number,
        accelerationTimeToTotalTimeRatio: number = 0.3) {

        this.startAngle = startAngle;
        this.targetAngle = targetAngle;
        this.totalTime = totalTime;
        this.accelerationTimeToTotalTimeRatio = accelerationTimeToTotalTimeRatio;
        this.currentAngle = startAngle;
    }

    public reset(newStartAngle: number, newTargetAngle: number): void {
        this.currentTime = 0;
        this.currentAngle = newStartAngle;
        this.isCompleted = false;
        this.startAngle = newStartAngle;
        this.targetAngle = newTargetAngle;
    }
    
    public getRotationAngleIncrement(deltaTime: number): number {
        if (this.isCompleted) {
            return 0;
        }
        
        const result = this.getRotationAngleResult(deltaTime);        
        this.currentTime = result.newCurrentTime;
        this.currentAngle += result.rotationAngleIncrement;
        this.isCompleted = result.isCompleted;
        
        return result.rotationAngleIncrement;
    }

    private getRotationAngleResult(deltaTime: number): RotationResult {
        const totalAngleDifference = this.targetAngle - this.startAngle;        
        const direction = totalAngleDifference >= 0 ? 1 : -1;
        const totalAngleDistance = Math.abs(totalAngleDifference);
        
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
            maxSpeed = totalAngleDistance / (accelerationTime + constantTime);
            acceleration = maxSpeed / accelerationTime;
        } else {
            acceleration = 4 * totalAngleDistance / (this.totalTime * this.totalTime);
            maxSpeed = acceleration * (this.totalTime / 2.0);
        }
        
        const newTime = Math.min(this.currentTime + deltaTime, this.totalTime);
        const currentTimeDistance = this.getDistanceAtTime(this.currentTime,
            accelerationTime, acceleration, constantTime);
        const newTimeDistance = this.getDistanceAtTime(newTime,
            accelerationTime, acceleration, constantTime);
        
        const rotationAngleIncrement = (newTimeDistance - currentTimeDistance) * direction;
        
        return {
            rotationAngleIncrement,
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
            const constatntVelosityTime = clampedTime - accelerationTime;
            return accelerationDistance + maxVelocity * constatntVelosityTime;
        }
        
        const constatntVelosityTime = maxVelocity * constantTime;
        
        const decelerationTime = clampedTime - (accelerationTime + constantTime);
        const decelerationDistance = maxVelocity * decelerationTime
            - 0.5 * acceleration * decelerationTime * decelerationTime;
        
        return accelerationDistance + constatntVelosityTime + decelerationDistance;
    }
    
    public getIsCompleted(): boolean {
        return this.isCompleted;
    }
}