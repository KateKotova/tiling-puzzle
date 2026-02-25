/**
 * Интерфейс параметров анимации
 */
export interface AnimationParameters {
    /**
     * Время анимации в миллисекундах
     */
    animationTime: number;
    /**
     * Доля времени ускоренного движения в пределах времени анимации.
     * Значение от 0 до 0.5.
     */
    accelerationTimeToAnimationTimeRatio: number;
}