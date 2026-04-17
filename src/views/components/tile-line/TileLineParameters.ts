import { AnimationParameters } from "../../../AnimationParameters.ts";
import { DraggableTileParameters } from "../../tile-decorators/DraggableTileParameters.ts";
import { TileParameters } from "../../tiles/TileParameters.ts";

/**
 * Интерфейс параметров линии, в которой содержатся элементы мозаики для сборки
 */
export interface TileLineParameters {
    /**
     * Коэффициент отношения продольного отступа содержимого от края к поперечному размеру.
     */
    longitudinalContentOffsetToTransverseSizeRatio: number;
    /**
     * Коэффициент отношения поперечного отступа содержимого от края к поперечному размеру.
     */
    transverseContentOffsetToTransverseSizeRatio: number;
    /**
     * Коэффициент отношения отступа между элементами мозаики к поперечному размеру.
     */
    betweenTilesOffsetToTransverseSizeRatio: number;
    tileParameters: TileParameters;
    draggableTileParameters: DraggableTileParameters;
    animationParameters: AnimationParameters;
}