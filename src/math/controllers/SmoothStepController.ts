import { ValueChangeResult } from "./ValueChangeResult.ts";

/**
 * Класс, контролирующий плавное изменение величины с течением времени
 */
export abstract class SmoothStepController<ValueType> {
    protected startValue: ValueType;
    public targetValue: ValueType;
    protected totalTime: number;
    protected accelerationTimeToTotalTimeRatio: number;
    protected currentTime: number = 0;
    protected currentValue: ValueType;
    protected isCompleted: boolean = false;

    /**
     * Создание контроллера плавного изменение величины с течением времени
     * @param startValue Начальное значение величины
     * @param targetValue Конечное значение величины
     * @param totalTime Общее время изменения величины
     * @param accelerationTimeToTotalTimeRatio Доля времени ускорения от общего времени.
     * Число от 0 до 0.5.
     */
    constructor(
        startValue: ValueType,
        targetValue: ValueType,
        totalTime: number,
        accelerationTimeToTotalTimeRatio: number = 0.3
    ) {
        this.startValue = startValue;
        this.targetValue = targetValue;
        this.totalTime = totalTime;
        this.accelerationTimeToTotalTimeRatio = accelerationTimeToTotalTimeRatio;
        this.currentValue = startValue;
    }
    
    public abstract reset(newStartValue: ValueType, newTargetValue: ValueType): void;
    
    public abstract getIncrement(deltaTime: number): ValueType;

    protected abstract getChangeResult(deltaTime: number): ValueChangeResult<ValueType>;

    protected getDistanceAtTime(
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
    
    public abstract complete(): void;
}