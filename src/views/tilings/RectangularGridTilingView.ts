import { Renderer, RenderLayer } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { RectangularGridTilingModel } from "../../models/tilings/RectangularGridTilingModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";

export class RectangularGridTilingView extends TilingView {
    constructor(model: TilingModel, selectedTileLayer: RenderLayer) {
        if (!(model instanceof RectangularGridTilingModel)) {
            throw new Error("The tiling model is not an instance of RectangularGridTilingModel");
        }
        super(model, selectedTileLayer);
    }

    public setExampleTiling(renderer: Renderer): void {
        const model = this.model as RectangularGridTilingModel;
        const tileViewFactory = new TileViewFactory();
        
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

                const tile = tileViewFactory
                    .getView(tileModel)
                    .getContainer(renderer, this.emptyTileFillColor);

                tile.pivot.set(tileModel.rotatingBoundingRectangleSize.width / 2.0 / tile.scale.x,
                    tileModel.rotatingBoundingRectangleSize.height / 2.0 / tile.scale.y);                
                tile.rotation = tileModel.rotationAngle;   
                tile.position.set(tileModel.centerPoint.x, tileModel.centerPoint.y);

                if (shouldFillByTexture) {
                    //tile.filters = [this.selectedTileGlowFilter];
                } else {
                    tile.alpha = 0.5;
                }

                this.tilingContainer.addChild(tile);
            }
        }
    }
}