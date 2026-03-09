import { AverageValueParameters } from "./AverageValueParameters";

/**
 * Контроллер усреднённого значения.
 * Значения накапливаются и усредняются.
 */
export class AverageValueController {
    private readonly parameters: AverageValueParameters;
    private values: number[] = [];
    
    constructor(parameters: AverageValueParameters) {
        this.parameters = parameters;
    }
    
    public addValue(value: number): void {
        const clampedValue = Math.max(-this.parameters.maxValue, 
            Math.min(this.parameters.maxValue, value));
        
        this.values.push(clampedValue);
        
        if (this.values.length > this.parameters.maxValueCount) {
            this.values.shift();
        }
    }
    
    /**
     * Получение взвешенного среднего значения: чем новее значение, тем оно важнее
     * @returns Усреднённое значение
     */
    public getAverageValue(): number {
        if (this.values.length === 0) {
            return 0;
        }

        const validValues = this.values.filter(value =>
            Math.abs(value) < this.parameters.maxValue
            * this.parameters.extremeZoneMaxValueMultiplier);
        if (validValues.length === 0) {
            return 0;
        }
        
        let weightedValuesSum = 0;
        let weightSum = 0;
        for (let valueIndex = 0; valueIndex < this.values.length; valueIndex++) {
            const value = this.values[valueIndex];
            const weight = valueIndex + 1;
            weightedValuesSum += value * weight;
            weightSum += weight;
        }
        
        return weightedValuesSum / weightSum;
    }
    
    public clearValues(): void {
        this.values = [];
    }
    
    public getMinValue(): number {
        return this.parameters.minValue;
    }
    
    public reset(): void {
        this.clearValues();
    }
}