import { Graphics, GraphicsPath } from "pixi.js";
import { SquareWithSingleLockTileModel }
    from "../../models/polygons/tiles/SquareWithSingleLockTileModel.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { RectangularGridTilingView } from "../RectangularGridTilingView.ts";
import { SquareWithSingleLockTilingModel } from "../../models/polygons/tilings/SquareWithSingleLockTilingModel.ts";

export class SquareWithSingleLockTilingView extends RectangularGridTilingView {
    constructor(model: TilingModel) {
        super(model);
        if (!(model instanceof SquareWithSingleLockTilingModel)) {
            throw new Error("The tiling model is not an instance of SquareWithSingleLockTilingModel");
        }
    }

    protected getTileGraphics(tileModel: TileModel): Graphics {
        if (!(tileModel instanceof SquareWithSingleLockTileModel)) {
            throw new Error("The tile is not an instance of SquareWithSingleLockTileModel");
        }

        const result = new Graphics()
            .path(new GraphicsPath(tileModel.getSvgPathString()))
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
        result.scale = tileModel.side / (result.width - result.strokeStyle.width);
        result.strokeStyle.width /= result.scale.x;
        return result;
    }
}