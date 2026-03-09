import { DeceleratedMotionParameters } from "./DeceleratedMotionParameters";
import { DeceleratedMotionResult } from "./DeceleratedMotionResult";

/**
 * Контроллер равнозамедленного движения
 */
export class DeceleratedMotionController {
    private static readonly millisecondsInSecond = 1000;
    private readonly parameters: DeceleratedMotionParameters;
    
    constructor(parameters: DeceleratedMotionParameters) {
        this.parameters = parameters;
    }
    
    /**
     * Расчет скорректированных параметров равнозамедленного движения
     * в пределах допустимых значений
     * @param startVelocity Начальная скорость
     * @param startValue Начальное значение величины
     * @param minValue Минимальное значение величины
     * @param maxValue Максимальное значение величины
     * @returns Результат в виде ускорения, времени движения и результирующего значения.
     */
    public getResult(
        startVelocity: number,
        startValue: number,
        minValue: number,
        maxValue: number,
    ): DeceleratedMotionResult {

        let acceleration = startVelocity > 0 
            ? -this.parameters.absoluteAcceleration 
            : this.parameters.absoluteAcceleration;
        
        let time = Math.abs(startVelocity / acceleration)
            * DeceleratedMotionController.millisecondsInSecond;
        time = Math.max(time, this.parameters.minMotionTime);
        
        const distanceToBound = startVelocity > 0
            ? maxValue - startValue
            : startValue - minValue;
        const timeToBound = 2 * distanceToBound / Math.abs(startVelocity)
            * DeceleratedMotionController.millisecondsInSecond;
        if (timeToBound < time) {
            time = Math.max(timeToBound, this.parameters.minMotionToBoundTime);
        }
        
        acceleration = -startVelocity / time
            * DeceleratedMotionController.millisecondsInSecond;
        
        const timeInSeconds = time / DeceleratedMotionController.millisecondsInSecond;
        const targetValue = startValue
            + startVelocity * timeInSeconds
            + acceleration * timeInSeconds * timeInSeconds / 2.0;
        
        return {
            acceleration,
            time,
            targetValue
        };
    }
}