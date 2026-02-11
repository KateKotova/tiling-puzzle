/**
 * Класс настроек модели.
 * Предполагается, что создаётся единственный экземпляр этого класса и везде передаётся.
 */
export class ModelSettings {
    /**
     * Время анимации элемента замощения в миллисекундах
     */
    public readonly tileAnimationTime: number = 300;
    /**
     * Доля времени ускоренного движения в пределах времени анимации элемента замощения.
     * Значение от 0 до 0.5.
     */
    public readonly accelerationTimeToTileAnimationTimeRatio: number = 0.3;

}