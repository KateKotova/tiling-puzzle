import { GlowFilterOptions } from "pixi-filters";
import { Color } from "pixi.js";

/**
 * Интерфейс параметров для круглой кнопки
 */
export interface CircleButtonParameters {
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