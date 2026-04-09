import { AnimationParameters } from "../../AnimationParameters";
import { TapParameters } from "../TapParameters";
import { StaticTileParameters } from "../tile-decorators/StaticTileParameters";
import { TileParameters } from "../tiles/TileParameters";

/**
 * Интерфейс параметров замощения
 */
export interface TilingParameters {
    tileParameters: TileParameters;
    staticTileParameters: StaticTileParameters;
    animationParameters: AnimationParameters;
    tapParameters: TapParameters;
    /**
     * Время показа картинки в самом начале игры в миллисекундах,
     * чтобы пользователь понимал, что он будет собирать
     */
    imageInitialShowTime: number;
}