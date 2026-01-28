import { Graphics, GraphicsPath } from "pixi.js";
import { TileView } from "./TileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";

export class SvgPathTileView extends TileView {
    constructor (model: TileModel) {
        if (model instanceof RegularPolygonTileModel) {
            throw new Error("The tile must not be an instance of RegularPolygonTileModel");
        }
        super(model);
    }

    public getGraphics(): Graphics {
        const result = new Graphics()
            .path(new GraphicsPath(this.model.getSvgPathString()))
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
        result.scale = this.model.rotatingBoundingRectangleSize.width
            / (result.width - result.strokeStyle.width);
        result.strokeStyle.width /= result.scale.x;
        return result;
    }
}