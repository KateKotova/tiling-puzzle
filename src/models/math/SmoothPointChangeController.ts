import { Point } from "pixi.js";
import { ChangeResult } from "./ChangeResult.ts";

export class SmoothPointChangeController {
    private startPoint: Point;
    private targetPoint: Point;
    private totalTime: number;
    private accelerationTimeToTotalTimeRatio: number;
    private currentTime: number = 0;
    private currentPoint: Point;
    private isCompleted: boolean = false;
    
    constructor(startPoint: Point,
        targetPoint: Point,
        totalTime: number,
        accelerationTimeToTotalTimeRatio: number = 0.3) {

        this.startPoint = startPoint.clone();
        this.targetPoint = targetPoint.clone();
        this.totalTime = totalTime;
        this.accelerationTimeToTotalTimeRatio = accelerationTimeToTotalTimeRatio;
        this.currentPoint = startPoint.clone();
    }

    public reset(newStartPoint: Point, newTargetPoint: Point): void {
        this.currentTime = 0;
        this.currentPoint = newStartPoint.clone();
        this.isCompleted = false;
        this.startPoint = newStartPoint.clone();
        this.targetPoint = newTargetPoint.clone();
    }
    
    public getIncrement(deltaTime: number): Point {
        if (this.isCompleted) {
            return new Point(0, 0);
        }
        
        const result = this.getChangeResult(deltaTime);        
        this.currentTime = result.newCurrentTime;
        this.currentPoint.x += result.increment.x;
        this.currentPoint.y += result.increment.y;
        this.isCompleted = result.isCompleted;
        
        return result.increment;
    }

    private getChangeResult(deltaTime: number): ChangeResult<Point> {
        const totalPointDifference = new Point(this.targetPoint.x - this.startPoint.x,
            this.targetPoint.y - this.startPoint.y);
        
        const totalDistance = Math.sqrt(totalPointDifference.x * totalPointDifference.x + 
            totalPointDifference.y * totalPointDifference.y);
        
        if (totalDistance === 0) {
            return {
                increment: new Point(0, 0),
                newCurrentTime: Math.min(this.currentTime + deltaTime, this.totalTime),
                isCompleted: this.currentTime + deltaTime >= this.totalTime
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
            increment: valueIncrement,
            newCurrentTime: newTime,
            isCompleted: newTime >= this.totalTime
        };
    }

    private getDistanceAtTime(
        time: number,
        accelerationTime: number,
        acceleration: number,
        constantTime: number
    ): number {
        const clampedTime = Math.max(0, Math.min(time, this.totalTime));
        
        if (clampedTime <= accelerationTime) {
            return 0.5 * acceleration * clampedTime * clampedTime;
        }
        
        const accelerationDistance = 0.5 * acceleration * accelerationTime * accelerationTime;
        const maxVelocity = acceleration * accelerationTime;

        if (clampedTime <= accelerationTime + constantTime) {
            const constantVelocityTime = clampedTime - accelerationTime;
            return accelerationDistance + maxVelocity * constantVelocityTime;
        }
        
        const constantVelocityDistance = maxVelocity * constantTime;
        const decelerationTime = clampedTime - (accelerationTime + constantTime);
        
        const decelerationDistance = maxVelocity * decelerationTime 
            - 0.5 * acceleration * decelerationTime * decelerationTime;
        
        return accelerationDistance + constantVelocityDistance + decelerationDistance;
    }
    
    public getIsCompleted(): boolean {
        return this.isCompleted;
    }
    
    public complete(): void {
        this.currentPoint = this.targetPoint.clone();
        this.isCompleted = true;
        this.currentTime = this.totalTime;
    }
}