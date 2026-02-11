import { RegularPolygonTileGeometry } from "../../models/tile-geometries/RegularPolygonTileGeometry.ts";
import { TileLockType } from "../../models/tile-locks/TileLockType.ts";
import { RegularPolygonTileView } from "./RegularPolygonTileView.ts";
import { SvgPathTileView } from "./SvgPathTileView.ts";
import { TileView } from "./TileView.ts";
import { TileViewParameters } from "./TileViewParameters.ts";

/**
 * Класс фабрики создания представлений элементов замощений
 */
export class TileViewFactory {
    public getView(tileViewParameters: TileViewParameters): TileView {
        return tileViewParameters.model.geometry instanceof RegularPolygonTileGeometry
            && tileViewParameters.model.geometry.lockType == TileLockType.None
            ? new RegularPolygonTileView(tileViewParameters)
            : new SvgPathTileView(tileViewParameters);
    }
}