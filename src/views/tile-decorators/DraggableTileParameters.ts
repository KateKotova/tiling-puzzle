import { GlowFilterOptions } from "pixi-filters";
import { TapParameters } from "../TapParameters";

/**
 * Интерфейс параметров подвижного элемента замощения
 */
export interface DraggableTileParameters {
    selectedGlowFilterOptions: GlowFilterOptions;
    correctLocatedFilterShowTime: number;
    correctLocatedGlowFilterOptions: GlowFilterOptions;
    tapParameters: TapParameters;
}