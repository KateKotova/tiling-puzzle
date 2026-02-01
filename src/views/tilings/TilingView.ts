import { Color, Container, Renderer, RenderLayer, Ticker } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { ViewSettings } from "../ViewSettings.ts";

export abstract class TilingView {
    protected viewSettings: ViewSettings;
    public model: TilingModel;
    public tilingContainer: Container;
    public emptyTilesContainer: Container;
    public tilesContainer: Container;
    protected emptyTileFillColor: Color = new Color(0x00AA00);
    protected selectedEmptyTileLayer: RenderLayer;
    protected selectedTileLayer: RenderLayer;

    constructor(viewSettings: ViewSettings, model: TilingModel) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }
        this.viewSettings = viewSettings;
        this.model = model;
        this.tilingContainer = this.createTilingContainer();

        this.emptyTilesContainer = new Container();
        this.tilingContainer.addChild(this.emptyTilesContainer);
        this.tilesContainer = new Container();
        this.tilingContainer.addChild(this.tilesContainer);
        this.selectedEmptyTileLayer = new RenderLayer();
        this.tilingContainer.addChild(this.selectedEmptyTileLayer);
        this.selectedTileLayer = new RenderLayer();
        this.tilingContainer.addChild(this.selectedTileLayer);
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