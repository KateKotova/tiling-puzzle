import { HintButtonParameters } from "./HintButtonParameters.ts";

/**
 * Интерфейс параметров контейнера панели управления,
 * которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export interface TilingLevelControlParameters {
    hintButtonParameters: HintButtonParameters;
    /**
     * Коэффициент отношения абсциссы центра кнопки подсказки
     * к ширине контейнера панели управления.
     */
    hintButtonCenterXToControlContainerWidthRatio: number;
    /**
     * Коэффициент отношения ординаты центра кнопки подсказки
     * к высоте контейнера панели управления.
     */
    hintButtonCenterYToControlContainerHeightRatio: number;
    /**
     * Коэффициент отношения радиуса кнопки подсказки
     * к высоте контейнера панели управления.
     */
    hintButtonRadiusToControlContainerHeightRatio: number;
}