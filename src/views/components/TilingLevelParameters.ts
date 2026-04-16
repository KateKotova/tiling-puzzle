import { TilingLevelControlParameters } from "./TilingLevelControlParameters.ts";
import { TilingLevelImageParameters } from "./TilingLevelImageParameters.ts";
import { TilingLevelCarouselParameters } from "./TilingLevelCarouselParameters.ts";

/**
 * Интерфейс параметров вертикального контейнера уровня мозаичного замощения
 */
export interface TilingLevelParameters {
    imageParameters: TilingLevelImageParameters;    
    carouselParameters: TilingLevelCarouselParameters;
    controlParameters: TilingLevelControlParameters;
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
    carouselContainerHeightToHeightRatio: number;
}