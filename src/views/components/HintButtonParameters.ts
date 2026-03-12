import { GlowFilterOptions } from "pixi-filters";
import { Color } from "pixi.js";

/**
 * Интерфейс параметров для кнопки показа подсказки
 */
export interface HintButtonParameters {
    generateTextureResolution: number,
    glowFilterOptions: GlowFilterOptions;
    radius: number;
    iconSide: number;
    defaultFillColor: Color;
    activeFillColor: Color;
    strokeWidth: number;
    defaultStrokeColor: Color;
    activeStrokeColor: Color;
    defaultIconFillColor: Color;
    activeIconFillColor: Color;
}