/**
 * Интерфейс параметров элемента замощения
 */
export interface TileParameters {
    /**
     * Время анимации элемента замощения в миллисекундах
     */
    animationTime: number;
    /**
     * Доля времени ускоренного движения в пределах времени анимации элемента замощения.
     * Значение от 0 до 0.5.
     */
    accelerationTimeToAnimationTimeRatio: number;
}