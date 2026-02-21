import { BevelFilterOptions } from "pixi-filters";

/**
 * Интерфейс параметров элемента замощения
 */
export interface TileParameters {
    cacheTileAsTextureResolution: number;
    generateTileTextureResolution: number;
    bevelFilterOptions: BevelFilterOptions;
}