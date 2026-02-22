import { StaticTileParameters } from "../tile-decorators/StaticTileParameters";
import { TileParameters } from "../tiles/TileParameters";

/**
 * Интерфейс параметров замощения
 */
export interface TilingParameters {
    tileParameters: TileParameters;
    staticTileParameters: StaticTileParameters;
}