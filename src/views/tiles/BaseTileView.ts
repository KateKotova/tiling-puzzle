import { Texture, Container, Renderer, Color, Filter } from "pixi.js";
import { BevelFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { TileViewParameters } from "./TileViewParameters.ts";
import { TileView } from "./TileView.ts";

export abstract class BaseTileView implements TileView {
    protected viewSettings: ViewSettings;
    public model: TileModel;
    public texture: Texture | null;
    public tile: Container;
    public content: Container;

    constructor (parameters: TileViewParameters) {
        this.viewSettings = parameters.viewSettings;
        this.model = parameters.model;
        this.texture = parameters.texture;
        this.content = this.createContent(parameters.renderer,
            parameters.replacingTextureFillColor);
        this.tile = this.createTile();
    }

    protected abstract createContent(renderer: Renderer, replacingTextureFillColor: Color)
        : Container;
    
    protected createTile(): Container {
        const result = new Container();       
        result.addChild(this.content);        
        result.cacheAsTexture({ resolution: this.viewSettings.tileTextureResolution });
        result.pivot.set(this.model.pivotPoint.x, this.model.pivotPoint.y);
        result.rotation = this.model.currentRotationAngle;   
        result.position = this.model.currentPositionPoint.clone();
        return result;
    }

    protected getBevelFilter(graphicsSideToSpriteSideRatio: number): BevelFilter {
        const options = this.viewSettings.bevelFilterOptions;
        return new BevelFilter({ 
            rotation: (options.rotation ?? 0)
                + (this.texture ? 0 : 180)
                - this.model.rotationAngle * 180 / Math.PI,
            thickness: (options.thickness ?? 0) * graphicsSideToSpriteSideRatio,
            lightColor: options.lightColor,
            lightAlpha: options.lightAlpha,
            shadowColor: options.shadowColor,
            shadowAlpha: options.shadowAlpha
        });
    }

    public setFilter(filter: Filter): void {
        this.content.filters = [filter];
        this.content.updateCacheTexture();
    }

    public removeFilters(): void {
        this.content.filters = [];
        this.content.updateCacheTexture();
    }

    public destroy(): void {
        this.tile.destroy();
    }
}