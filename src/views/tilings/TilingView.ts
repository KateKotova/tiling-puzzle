import { Color, Container, Renderer, RenderLayer, Ticker } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { GlowFilter } from "pixi-filters";
import { ViewSettings } from "../ViewSettings.ts";

export abstract class TilingView {
    protected viewSettings: ViewSettings;
    public model: TilingModel;
    public tilingContainer: Container;
    public emptyTileFillColor: Color = new Color(0x00AA00);
    public selectedTileLayer: RenderLayer;
    public selectedTileGlowFilterColor: Color = new Color(0x00FF00);
    public selectedTileGlowFilter: GlowFilter = new GlowFilter({
        distance: 5,
        outerStrength: 2,
        innerStrength: 1,
        color: this.selectedTileGlowFilterColor,
        quality: 0.5,
        knockout: false
    });

    constructor(viewSettings: ViewSettings, model: TilingModel, selectedTileLayer: RenderLayer) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }
        this.viewSettings = viewSettings;
        this.model = model;
        this.tilingContainer = this.createTilingContainer();
        this.selectedTileLayer = selectedTileLayer;
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