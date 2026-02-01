import { TileType } from "../../models/tiles/TileType.ts";
import { RegularPolygonTileView } from "./RegularPolygonTileView.ts";
import { SvgPathTileView } from "./SvgPathTileView.ts";
import { TileView } from "./TileView.ts";
import { TileViewParameters } from "./TileViewParameters.ts";

export class TileViewFactory {
    public getView(tileViewParameters: TileViewParameters): TileView {
        return tileViewParameters.model.tileType == TileType.RegularPolygon
            ? new RegularPolygonTileView(tileViewParameters)
            : new SvgPathTileView(tileViewParameters);
    }
}