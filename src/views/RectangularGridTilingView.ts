import { Graphics, GraphicsContext } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { RectangularGridTilingModel } from "../models/tilings/RectangularGridTilingModel.ts";
import { TileModel } from "../models/tiles/TileModel.ts";
import { TilingModel } from "../models/tilings/TilingModel.ts";

export abstract class RectangularGridTilingView extends TilingView {
    constructor(model: TilingModel) {
        if (!(model instanceof RectangularGridTilingModel)) {
            throw new Error("The tiling model is not an instance of RectangularGridTilingModel");
        }
        super(model);
    }

    protected abstract getTileGraphicsContext(tileModel: TileModel): GraphicsContext;

    public setExampleTiling(): void {
        const model = this.model as RectangularGridTilingModel;
        for (let rowIndex = 0; rowIndex < model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.textureTileColumnCount;
                columnIndex++) {

                if (!model.getGridIndicesAreCorrect(rowIndex, columnIndex)) {
                    continue;
                }

                const shouldFillByTexture = Math.random() >= 0.5;
                const tileModel = model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);
                if (!tileModel) {
                    continue;
                }

                const tile = new Graphics(this.getTileGraphicsContext(tileModel));
                if (shouldFillByTexture) {
                    tile.fill({
                        texture: tileModel.texture,
                        textureSpace: "local"
                    });
                }

                this.tilingContainer.addChild(tile);
            }
        }
    }
}