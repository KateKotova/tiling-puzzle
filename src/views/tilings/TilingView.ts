import { Color, Container, Renderer, RenderLayer } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { GlowFilter } from "pixi-filters";

export abstract class TilingView {
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

    constructor(model: TilingModel, selectedTileLayer: RenderLayer) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }
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

    public abstract setExampleTiling(renderer: Renderer): void;
}