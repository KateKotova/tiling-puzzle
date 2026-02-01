import { Color, Container, Renderer, RenderLayer, Ticker } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { BevelFilter } from "pixi-filters";
import { ViewSettings } from "../ViewSettings.ts";

export abstract class TileView {
    protected viewSettings: ViewSettings;
    public model: TileModel;
    public tile: Container;
    public content: Container;
    private selectedTileLayer: RenderLayer;
    private rotationAngleDifference: number = 0;
    private ticker: Ticker;
    private isSelected: boolean = false;

    private boundOnPointerTap: (event: PointerEvent) => void = this.onPointerTap.bind(this);
    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);
    
    constructor (
        viewSettings: ViewSettings,
        model: TileModel,
        renderer: Renderer,
        ticker: Ticker,
        replacingTextureFillColor: Color,
        selectedTileLayer: RenderLayer) {

        this.viewSettings = viewSettings;
        this.model = model;
        this.content = this.createContent(renderer, replacingTextureFillColor);
        this.tile = this.createTile();
        this.selectedTileLayer = selectedTileLayer;
        this.ticker = ticker;

        if (this.model.texture) {
            this.tile.eventMode = "static";
            this.tile.cursor = "pointer";
            this.tile.on("pointertap", this.boundOnPointerTap);
        }
    }

    protected abstract createContent(renderer: Renderer, replacingTextureFillColor: Color)
        : Container;

    private createTile(): Container {
        const result = new Container();        
        result.addChild(this.content);
        result.cacheAsTexture({ resolution: this.viewSettings.tileTextureResolution });
        result.pivot.set(this.model.pivotPoint.x, this.model.pivotPoint.y);
        result.rotation = this.model.rotationAngle;   
        result.position.set(this.model.positionPoint.x, this.model.positionPoint.y);
        return result;
    }

    protected getBevelFilter(graphicsSideToSpriteSideRatio: number): BevelFilter {
        const options = this.viewSettings.bevelFilterOptions;
        return new BevelFilter({ 
            rotation: (options.rotation ?? 0)
                + (this.model.texture ? 0 : 180)
                - this.model.rotationAngle * 180 / Math.PI,
            thickness: (options.thickness ?? 0) * graphicsSideToSpriteSideRatio,
            lightColor: options.lightColor,
            lightAlpha: options.lightAlpha,
            shadowColor: options.shadowColor,
            shadowAlpha: options.shadowAlpha
        });
    }

    private onPointerTap(event: PointerEvent): void {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        this.tile.off("pointertap", this.boundOnPointerTap);
        const rotationAngleDifference = this.model.getSamePositionNextAngleMinAngleDifference();
        this.prepareToRotation(rotationAngleDifference);
        this.ticker.add(this.boundOnRotationTicker);
    }

    private onRotationTicker(ticker: Ticker) {
        this.executeRotation(ticker.deltaMS);
        if (this.model.getRotaionIsCompleted()) {
            this.completeRotation();
            this.ticker.remove(this.boundOnRotationTicker);
            this.tile.on("pointertap", this.boundOnPointerTap);
        }        
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        this.rotationAngleDifference = rotationAngleDifference;
        this.model.prepareToRotation(this.rotationAngleDifference);
        this.selectedTileLayer.attach(this.tile);
        
        if (!this.isSelected) {
            this.addSelectedTileGlowFilter();
        }
    }

    private executeRotation(deltaTime: number): void {
        this.model.executeRotation(deltaTime);
        this.tile.rotation = this.model.currentRotationAngle;
    }

    private completeRotation(): void {
        if (!this.isSelected) {
            this.removeSelectedTileGlowFilter();
        }

        this.selectedTileLayer.detach(this.tile);
        this.model.completeRotation();
        this.tile.rotation = this.model.currentRotationAngle;
    }

    private addSelectedTileGlowFilter(): void {
        if (this.tile.filters) {
            this.tile.filters = [...this.tile.filters, this.viewSettings.selectedTileGlowFilter];
        } else {
            this.tile.filters = [this.viewSettings.selectedTileGlowFilter];
        }
        this.tile.updateCacheTexture();
    }

    private removeSelectedTileGlowFilter(): void {
        if (this.tile.filters) {
            this.tile.filters = this.tile.filters.filter(item =>
                item !== this.viewSettings.selectedTileGlowFilter);
            this.tile.updateCacheTexture();
        }
    }
}