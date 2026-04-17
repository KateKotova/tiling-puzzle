import { Padding } from "../../../../math/Padding.ts";
import { TileLineParameters } from "../../tile-line/TileLineParameters.ts";
import { CarouselParameters } from "../../carousel/CarouselParameters.ts";

/**
 * Интерфейс параметров контейнера карусели линии,
 * в которой содержатся элементы мозаики для сборки
 * и которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export interface TilingLevelCarouselParameters {
    tileLineParameters: TileLineParameters;
    carouselParameters: CarouselParameters;
    /**
     * Отступы для внутреннего контейнера.
     */
    padding: Padding;
}