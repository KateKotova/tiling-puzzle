import { BevelFilterOptions, GlowFilterOptions } from "pixi-filters";

/**
 * Интерфейс параметров элемента замощения
 */
export interface TileParameters {
    cacheTileAsTextureResolution: number;
    generateTileTextureResolution: number;
    /**
     * Признак того, что границу элемента замощения следует размывать.
     */
    shouldBlurBorder: boolean;
    /**
     * Ширина области размытия границы элемента замощения.
     */
    borderBlurPadding: 1.5,
    bevelFilterOptions: BevelFilterOptions;
    hintGlowFilterOptions: GlowFilterOptions;
}