import { Renderer, Ticker } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { RectangularGridTilingModel } from "../../models/tilings/RectangularGridTilingModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { TileViewParameters } from "../tiles/TileViewParameters.ts";
import { StaticTileView } from "../tiles/StaticTileView.ts";
import { DragableTileView } from "../tiles/DragableTileView.ts";

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
                    replacingTextureFillColor: this.staticTileFillColor
                };
                const filledTileView = tileViewFactory.getView(tileViewParameters);
                filledTileView.content.alpha = 0.7;
                this.staticTilesContainer.addChild(filledTileView.tile);
                const staticTileView = new StaticTileView(this.viewSettings,
                    filledTileView, this.draggingTileData);

                const shouldCreateTexturedTile = Math.random() >= 0.5;
                if (shouldCreateTexturedTile) {
                    tileViewParameters.texture = model.getTileTexture(tileModel);
                    const texturedTileView = tileViewFactory.getView(tileViewParameters);
                    this.tilesContainer.addChild(texturedTileView.tile);
                    const dragableTileView = new DragableTileView(
                        this.viewSettings,
                        texturedTileView,
                        this.selectedTileContainer,
                        ticker,
                        this.draggingTileData);
                    dragableTileView.dragSource = staticTileView;
                }
            }
        }
    }
}