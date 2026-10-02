import { BevelFilterOptions, GlowFilterOptions } from "pixi-filters";

/**
 * Интерфейс параметров элемента замощения
 */
export interface TileParameters {
    cacheTileAsTextureResolution: number;
    generateTileTextureResolution: number;
    /**
     * Признак того, что обводку элемента замощения следует сглаживать.
     */
    shouldSmoothOutline: boolean;
    bevelFilterOptions: BevelFilterOptions;
    hintGlowFilterOptions: GlowFilterOptions;
}