import { Color, Texture } from "pixi.js";
import { TilingType } from "../../models/tilings/TilingType.ts";
import { Padding } from "../../math/Padding.ts";
import { TileParameters } from "../../models/tiles/TileParameters.ts";
import { TilingLayoutStrategyType } from "../../models/tilings/TilingLayoutStrategyType.ts";
import { ZoomAndPanParameters } from "./ZoomAndPanParameters.ts";
import { TilingParameters } from "../tilings/TilingParameters.ts";
import { TileLineParameters } from "./TileLineParameters.ts";
import { CarouselParameters } from "./CarouselParameters.ts";
import { HintButtonParameters } from "./HintButtonParameters.ts";

/**
 * Интерфейс параметров вертикального контейнера уровня мозаичного замощения
 */
export interface TilingLevelParameters {
    textureMinSideTileCount: number;
    tilingType: TilingType;
    tilingTexture: Texture;
    tileModelParameters: TileParameters;
    tilingLayoutStrategyType: TilingLayoutStrategyType;
    imageZoomAndPanParameters: ZoomAndPanParameters;
    tilingParameters: TilingParameters;

    tileLineParameters: TileLineParameters;
    tileLineCarouselParameters: CarouselParameters;

    hintButtonParameters: HintButtonParameters;
    hintButtonIconSvgPath: string;
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

    /**
     * Коэффициент отношения высоты контейнера панели управления к высоте данного контейнера.
     */
    controlContainerHeightToHeightRatio: number;
    /**
     * Коэффициент отношения высоты контейнера,
     * который содержит контейнер карусели с линией,
     * в которой содержатся элементы мозаики для сборки,
     * к высоте данного контейнера.
     */
    tileLineCarouselParentContainerHeightToHeightRatio: number;
    /**
     * Внутренние отступы родительского контейнера
     * для контейнера области изображения.
     */
    imageAreaParentContainerPadding: Padding;
    /**
     * Внутренние отступы родительского контейнера
     * для контейнера карусели с линией.
     */
    tileLineCarouselParentContainerPadding: Padding;

    /**
     * Цвет заливки фона контейнера линии, в которой содержатся элементы мозаики для сборки
     */
    tileLineContainerBackgroundFillColor?: Color;
    /**
     * Цвет заливки статических элементов замощения по умолчанию
     */
    defaultStaticTileFillColor: Color;
    /**
     * Цвет заливки статических элементов, который устанавливается
     * для фигур того же типа геометрии, что и выбранный перетаскиваемый элемент замощения
     */
    targetStaticTileFillColor: Color;
}