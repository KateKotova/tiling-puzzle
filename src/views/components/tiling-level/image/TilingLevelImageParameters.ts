import { Padding } from "../../../../math/Padding.ts";
import { TileParameters } from "../../../../models/tiles/TileParameters.ts";
import { ZoomAndPanParameters } from "../../zoom-and-pan/ZoomAndPanParameters.ts";
import { TilingParameters } from "../../../tilings/TilingParameters.ts";

/**
 * Интерфейс параметров контейнера изображения для сборки мозаики,
 * которое должно находиться в вертикальном контейнере уровня мозаичного замощения
 */
export interface TilingLevelImageParameters {
    tileModelParameters: TileParameters;    
    zoomAndPanParameters: ZoomAndPanParameters;
    tilingParameters: TilingParameters;
    /**
     * Отступы для внутреннего контейнера.
     */
    padding: Padding;
}