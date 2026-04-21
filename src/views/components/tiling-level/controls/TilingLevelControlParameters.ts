import { HintButtonParameters } from "../../hint-button/HintButtonParameters.ts";

/**
 * Интерфейс параметров контейнера панели управления,
 * которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export interface TilingLevelControlParameters {
    hintButtonParameters: HintButtonParameters;
    /**
     * Коэффициент отношения абсциссы центра кнопки подсказки-глазика
     * к ширине контейнера панели управления.
     */
    eyeHintButtonCenterXToControlContainerWidthRatio: number;
    /**
     * Коэффициент отношения абсциссы центра кнопки подсказки-лампочки
     * к ширине контейнера панели управления.
     */
    lampHintButtonCenterXToControlContainerWidthRatio: number;
    /**
     * Коэффициент отношения ординаты центра кнопки подсказки
     * к высоте контейнера панели управления.
     */
    hintButtonCenterYToControlContainerHeightRatio: number;
    /**
     * Коэффициент отношения радиуса кнопки подсказки
     * к минимальной стороне контейнера панели управления.
     */
    hintButtonRadiusToControlContainerMinSideRatio: number;
}