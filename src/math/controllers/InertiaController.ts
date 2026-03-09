import { ValueChangeResult } from "./ValueChangeResult";

/**
 * Класс, контролирующий равнозамедленное изменение величины с течением времени
 */
export class InertiaController {
    private static readonly millisecondsInSecond = 1000;
    private startValue: number;
    public targetValue: number;
    private totalTime: number;
    private currentTime: number = 0;
    private currentValue: number;
    private velocity: number;
    private acceleration: number;
    private isCompleted: boolean = false;
    
    /**
     * Создание контроллера равнозамедленного изменения величины с течением времени
     * @param startValue Начальное значение величины
     * @param velocity Начальная скорость изменения величины
     * @param acceleration Ускорение изменения величины
     * @param totalTime Общее время изменения величины в миллисекундах
     */
    constructor(
        startValue: number,
        velocity: number,
        acceleration: number,
        totalTime: number
    ) {
        this.startValue = startValue;
        this.totalTime = totalTime;
        this.currentValue = startValue;
        this.velocity = velocity;
        this.acceleration = acceleration;

        const totalTimeInSeconds = this.getTotalTimeInSeconds();
        this.targetValue = startValue
            + velocity * totalTimeInSeconds
            + acceleration * totalTimeInSeconds * totalTimeInSeconds / 2;
    }

    private getTotalTimeInSeconds(): number {
        return this.totalTime / InertiaController.millisecondsInSecond;
    }
    
    public reset(newStartValue: number, newTargetValue: number): void {
        this.currentTime = 0;
        this.currentValue = newStartValue;
        this.isCompleted = false;
        this.startValue = newStartValue;
        this.targetValue = newTargetValue;

        const totalTimeInSeconds = this.getTotalTimeInSeconds();
        this.velocity = (newTargetValue - newStartValue) / totalTimeInSeconds * 2;
        this.acceleration = -this.velocity / totalTimeInSeconds;
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

    private getChangeResult(deltaTime: number): ValueChangeResult<number> {
        const newTime = Math.min(this.currentTime + deltaTime, this.totalTime);

        const currentValue = this.getValue(this.currentTime);
        const newValue = this.getValue(newTime);

        const valueIncrement = newValue - currentValue;
        
        return {
            valueIncrement,
            newCurrentTime: newTime,
            valueChangeIsCompleted: newTime >= this.totalTime
        };
    }

    private getValue(time: number): number {
        const timeInSeconds = time / InertiaController.millisecondsInSecond;
        return this.startValue
            + this.velocity * timeInSeconds
            + this.acceleration * timeInSeconds * timeInSeconds / 2.0;
    }
    
    public getIsCompleted(): boolean {
        return this.isCompleted;
    }

    public complete(): void {
        this.currentValue = this.targetValue;
        this.isCompleted = true;
        this.currentTime = this.totalTime;
    }
}