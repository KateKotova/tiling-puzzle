import { Graphics } from "pixi.js";
import { TileView } from "./TileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";

export class RegularPolygonTileView extends TileView {
    constructor (model: TileModel) {
        if (!(model instanceof RegularPolygonTileModel)) {
            throw new Error("The tile is not an instance of RegularPolygonTileModel");
        }
        super(model);
    }

    public getGraphics(): Graphics {
        const model = this.model as RegularPolygonTileModel;
        return new Graphics()
            .regularPoly(
                model.absoluteBoundingRectangle.width / 2.0,
                model.absoluteBoundingRectangle.height / 2.0,
                model.circumscribedCircleRadius,
                model.sideCount,
                model.regularPolygonInitialRotationAngle
            )
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }
}