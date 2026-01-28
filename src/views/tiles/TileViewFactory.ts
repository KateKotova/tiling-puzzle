import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileType } from "../../models/tiles/TileType.ts";
import { RegularPolygonTileView } from "./RegularPolygonTileView.ts";
import { SvgPathTileView } from "./SvgPathTileView.ts";
import { TileView } from "./TileView.ts";

export class TileViewFactory {
    public getView(model: TileModel): TileView {
        return model.tileType == TileType.RegularPolygon
            ? new RegularPolygonTileView(model)
            : new SvgPathTileView(model);
    }
}