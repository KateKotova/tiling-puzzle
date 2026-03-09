/**
 * Интерфейс результата равнозамедленного движения
 */
export interface DeceleratedMotionResult {
    /**
     * Ускорение
     */
    acceleration: number;
    /**
     * Время в миллисекундах 
     */
    time: number;
    /**
     * Результирующее значение, которое получится после торможения
     */
    targetValue: number;
}