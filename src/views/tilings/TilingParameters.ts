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
    /**
     * Задержка времени между показом фильтра подсказки для потенциальной перетаскиваемой фигуры
     * и показом фильтра подсказки для целевой ячейки этой фигуры,
     * а также показом фильтра подсказки для фигуры, которая занимает эту ячейку.
     */
    potentialTargetHintGlowFilterShowDelay: number;
}