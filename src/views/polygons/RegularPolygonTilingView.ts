import { Graphics } from "pixi.js";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { RectangularGridTilingView } from "../RectangularGridTilingView.ts";

export class RegularPolygonTilingView extends RectangularGridTilingView {
    constructor(model: TilingModel) {
        super(model);
    }

    protected getTileGraphics(tileModel: TileModel): Graphics {
        if (!(tileModel instanceof RegularPolygonTileModel)) {
            throw new Error("The tile is not an instance of RegularPolygonTileModel");
        }

        return new Graphics()
            .regularPoly(
                tileModel.rotatingBoundingRectangle.width / 2.0,
                tileModel.rotatingBoundingRectangle.height / 2.0,
                tileModel.circumscribedCircleRadius,
                tileModel.sideCount,
                tileModel.regularPolygonInitialRotationAngle
            )
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }
}