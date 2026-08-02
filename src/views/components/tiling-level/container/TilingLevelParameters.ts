import { TilingLevelControlParameters } from "../controls/TilingLevelControlParameters.ts";
import { TilingLevelImageParameters } from "../image/TilingLevelImageParameters.ts";
import { TilingLevelCarouselParameters } from "../carousel/TilingLevelCarouselParameters.ts";
import { CongratulationModalParameters } from "../../congratulation-modal/CongratulationModalParameters.ts";

/**
 * Интерфейс параметров вертикального контейнера уровня мозаичного замощения
 */
export interface TilingLevelParameters {
    imageParameters: TilingLevelImageParameters;    
    carouselParameters: TilingLevelCarouselParameters;
    controlParameters: TilingLevelControlParameters;
    congratulationModalParameters: CongratulationModalParameters;
    /**
     * Задержка показа модального окна с поздравлениями
     * после успешного окончания игры
     */
    congratulationModalShowDelay: number;
    /**
     * Коэффициент отношения высоты контейнера панели управления
     * к минимальной стороне данного контейнера.
     */
    controlContainerHeightToMinSideRatio: number;
    /**
     * Коэффициент отношения максимальной высоты контейнера карусели с фигурами
     * к минимальной стороне данного контейнера.
     */
    carouselContainerMaxHeightToMinSideRatio: number;
    /**
     * Коэффициент отношения максимальной высоты линии,
     * в которой содержатся элементы мозаики для сборки,
     * к ширине этой линии.
     */
    tileLineMaxHeightToTileLineWidthRatio: number;
}