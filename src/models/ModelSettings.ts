import { TileParameters } from "./tiles/TileParameters";

/**
 * Класс настроек модели.
 * Предполагается, что создаётся единственный экземпляр этого класса и везде передаётся.
 */
export class ModelSettings {
    public readonly tileParameters: TileParameters = {
        animationTime: 300,
        accelerationTimeToAnimationTimeRatio: 0.3
    };
}