import { TilingLevelImageUniqueParameters } from "../image/TilingLevelImageUniqueParameters.ts";
import { TilingLevelCarouselUniqueParameters } from "../carousel/TilingLevelCarouselUniqueParameters.ts";

/**
 * Интерфейс уникальных для данного уровня
 * параметров вертикального контейнера уровня мозаичного замощения
 */
export interface TilingLevelUniqueParameters {
    imageParameters: TilingLevelImageUniqueParameters;
    carouselParameters: TilingLevelCarouselUniqueParameters;
    eyeHintButtonIconSvgPath: string;
    lampHintButtonIconSvgPath: string;
}