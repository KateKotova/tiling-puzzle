import { GraphicsContext } from "pixi.js";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { RectangularGridTilingView } from "../RectangularGridTilingView.ts";

export class RegularPolygonTilingView extends RectangularGridTilingView {
    constructor(model: TilingModel) {
        super(model);
    }

    protected getTileGraphicsContext(tileModel: TileModel): GraphicsContext {
        if (!(tileModel instanceof RegularPolygonTileModel)) {
            throw new Error("The tile is not an instance of RegularPolygonTileModel");
        }

        return new GraphicsContext()
            .regularPoly(
                tileModel.centerPoint.x,
                tileModel.centerPoint.y,
                tileModel.circumscribedCircleRadius,
                tileModel.sideCount,
                tileModel.rotationAngle
            )
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }
}