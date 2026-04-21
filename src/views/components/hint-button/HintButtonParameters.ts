import { GlowFilterOptions } from "pixi-filters";
import { Color } from "pixi.js";

/**
 * Интерфейс параметров для кнопки показа подсказки
 */
export interface HintButtonParameters {
    glowFilterOptions: GlowFilterOptions;
    iconSideToDiameterRatio: number;
    defaultFillColor: Color;
    activeFillColor: Color;
    strokeWidth: number;
    defaultStrokeColor: Color;
    activeStrokeColor: Color;
    defaultIconFillColor: Color;
    activeIconFillColor: Color;
}