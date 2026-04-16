import { TilingLevelImageUniqueParameters } from "./TilingLevelImageUniqueParameters.ts";
import { TilingLevelCarouselUniqueParameters } from "./TilingLevelCarouselUniqueParameters.ts";

/**
 * Интерфейс уникальных для данного уровня
 * параметров вертикального контейнера уровня мозаичного замощения
 */
export interface TilingLevelUniqueParameters {
    imageParameters: TilingLevelImageUniqueParameters;
    carouselParameters: TilingLevelCarouselUniqueParameters;
    hintButtonIconSvgPath: string;
}