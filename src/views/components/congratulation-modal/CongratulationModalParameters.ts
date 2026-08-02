import { Color } from "pixi.js";

/**
 * Интерфейс параметров модального окна поздравления победителя
 */
export interface CongratulationModalParameters {
    /**
     * Коэффициент отношения максимально возможной ширины модального окна к ширине экрана
     */
    maxWidthToScreenWidthRatio: number;
    /**
     * Коэффициент отношения максимально возможной высоты модального окна к высоте экрана
     */
    maxHeightToScreenHeightRatio: number;
    /**
     * Цвет подложки под модальным окном, которая покрывает весь экран,
     * чтобы он не был интерактивным
     */
    overlayColor: Color;
    overlayAlpha: number;
    /**
     * Коэффициент отношения внутреннего отступа модального окна к его минимальной стороне
     */
    paddingToMinSideRatio: number;
    /**
     * Цвет заливки модального окна
     */
    fillColor: Color;
    /**
     * Цвет обводки модального окна
     */
    strokeColor: Color;
    /**
     * Ширина обводки модального окна
     */
    strokeWidth: number;
    /**
     * Цвет текста внутри модального окна
     */
    textColor: Color;
    text: string,
    fontFamily: string
};