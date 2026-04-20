import { TilingLevelControlParameters } from "../controls/TilingLevelControlParameters.ts";
import { TilingLevelImageParameters } from "../image/TilingLevelImageParameters.ts";
import { TilingLevelCarouselParameters } from "../carousel/TilingLevelCarouselParameters.ts";

/**
 * Интерфейс параметров вертикального контейнера уровня мозаичного замощения
 */
export interface TilingLevelParameters {
    imageParameters: TilingLevelImageParameters;    
    carouselParameters: TilingLevelCarouselParameters;
    controlParameters: TilingLevelControlParameters;
    /**
     * Коэффициент отношения высоты контейнера панели управления
     * к минимальной стороне данного контейнера.
     */
    controlContainerHeightToMinSideRatio: number;
    /**
     * Коэффициент отношения высоты линии,
     * в которой содержатся элементы мозаики для сборки,
     * к ширине этой линии.
     */
    tileLineHeightToTileLineWidthRatio: number;
}