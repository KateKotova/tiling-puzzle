import { Renderer, Ticker } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { RectangularGridTilingModel } from "../../models/tilings/RectangularGridTilingModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { TileViewParameters } from "../tiles/TileViewParameters.ts";

export class RectangularGridTilingView extends TilingView {
    constructor(viewSettings: ViewSettings, model: TilingModel) {
        if (!(model instanceof RectangularGridTilingModel)) {
            throw new Error("The tiling model is not an instance of RectangularGridTilingModel");
        }
        super(viewSettings, model);
    }

    public setExampleTiling(renderer: Renderer, ticker: Ticker): void {
        const model = this.model as RectangularGridTilingModel;
        const tileViewFactory = new TileViewFactory();
        
        for (let rowIndex = 0; rowIndex < model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.textureTileColumnCount;
                columnIndex++) {

                if (!model.getGridIndicesAreCorrect(rowIndex, columnIndex)) {
                    continue;
                }

                const tileModel = model.getTileModel(rowIndex, columnIndex);
                if (!tileModel) {
                    continue;
                }
                tileModel.currentRotationAngle = tileModel.rotationAngle;

                const tileViewParameters: TileViewParameters = {
                    viewSettings: this.viewSettings,
                    model: tileModel,
                    texture: null,
                    renderer,
                    ticker,
                    replacingTextureFillColor: this.emptyTileFillColor,
                    selectedTileLayer: this.selectedTileLayer
                };
                const emptyTileView = tileViewFactory.getView(tileViewParameters);
                emptyTileView.content.alpha = 0.7;
                this.emptyTilesContainer.addChild(emptyTileView.tile);

                const shouldCreateTexturedTile = Math.random() >= 0.5;
                if (shouldCreateTexturedTile) {
                    tileViewParameters.texture = model.getTileTexture(tileModel);
                    const tileView = tileViewFactory.getView(tileViewParameters);
                    this.tilesContainer.addChild(tileView.tile);
                }
            }
        }
    }
}