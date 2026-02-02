import { Color, Container, Renderer, Ticker } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { DraggingTileData } from "../tiles/DraggingTileData.ts";

export abstract class TilingView {
    protected viewSettings: ViewSettings;
    public model: TilingModel;
    public tilingContainer: Container;
    public staticTilesContainer: Container;
    public tilesContainer: Container;
    protected staticTileFillColor: Color = new Color(0x00AA00);
    protected selectedTileContainer: Container;
    protected draggingTileData: DraggingTileData = { view: null };

    constructor(viewSettings: ViewSettings, model: TilingModel) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }

        this.viewSettings = viewSettings;
        this.model = model;
        this.tilingContainer = this.createTilingContainer();

        this.staticTilesContainer = new Container();
        this.tilingContainer.addChild(this.staticTilesContainer);
        this.tilesContainer = new Container();
        this.tilingContainer.addChild(this.tilesContainer);
        this.selectedTileContainer = new Container();
        this.tilingContainer.addChild(this.selectedTileContainer);
    }

    private createTilingContainer(): Container {
        const rectangle = this.model.tilingContainerModel!.boundingRectangle;
        return new Container({
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        });
    }

    public abstract setExampleTiling(renderer: Renderer, ticker: Ticker): void;
}