import { RegularPolygonTileGeometry }
    from "../../models/tile-geometries/RegularPolygonTileGeometry.ts";
import { TileLockType } from "../../models/tile-locks/TileLockType.ts";
import { RegularPolygonTileView } from "./RegularPolygonTileView.ts";
import { SvgPathTileView } from "./SvgPathTileView.ts";
import { TileParameters } from "./TileParameters.ts";
import { TileView } from "./TileView.ts";
import { TileViewCreationParameters } from "./TileViewCreationParameters.ts";

/**
 * Класс фабрики создания представлений элементов замощений
 */
export class TileViewFactory {
    public getView(
        tileParameters: TileParameters,
        tileViewCreationParameters: TileViewCreationParameters
    ): TileView {
        return tileViewCreationParameters.model.geometry instanceof RegularPolygonTileGeometry
            && tileViewCreationParameters.model.geometry.lockType === TileLockType.None
            ? new RegularPolygonTileView(tileParameters, tileViewCreationParameters)
            : new SvgPathTileView(tileParameters, tileViewCreationParameters);
    }
}