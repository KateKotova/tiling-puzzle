import { Color, Container, FederatedPointerEvent, Point, Renderer, RenderLayer, Texture, Ticker } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { BevelFilter } from "pixi-filters";
import { ViewSettings } from "../ViewSettings.ts";
import { TileViewParameters } from "./TileViewParameters.ts";

export abstract class TileView {
    protected viewSettings: ViewSettings;
    public model: TileModel;
    public texture: Texture | null;
    public tile: Container;
    public content: Container;
    private selectedTileLayer: RenderLayer;
    private rotationAngleDifference: number = 0;
    private ticker: Ticker;
    private isDragging: boolean = false;
    private dragOffset: Point = new Point();
    private dragStartPosition: Point = new Point();
    private dragStartTime: number = 0;

    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);
    
    constructor (parameters: TileViewParameters) {
        this.viewSettings = parameters.viewSettings;
        this.model = parameters.model;
        this.texture = parameters.texture;
        this.content = this.createContent(parameters.renderer,
            parameters.replacingTextureFillColor);
        this.tile = this.createTile();
        this.selectedTileLayer = parameters.selectedTileLayer;
        this.ticker = parameters.ticker;

        if (this.texture) {
            this.tile.eventMode = "static";
            this.tile.cursor = "pointer";
            this.tile.on('pointerdown', this.onPointerDown, this);
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
                + (this.texture ? 0 : 180)
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

        this.tile.off('pointerdown', this.onPointerDown, this);
        const rotationAngleDifference = this.model.getSamePositionNextAngleMinAngleDifference();
        this.prepareToRotation(rotationAngleDifference);
        this.ticker.add(this.boundOnRotationTicker);
    }

    private onRotationTicker(ticker: Ticker) {
        this.executeRotation(ticker.deltaMS);
        if (this.model.getRotaionIsCompleted()) {
            this.completeRotation();
            this.ticker.remove(this.boundOnRotationTicker);
            this.tile.on('pointerdown', this.onPointerDown, this);
        }        
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        this.isDragging = true;

        this.tile.off('pointerdown', this.onPointerDown, this);
        this.tile.on('globalpointermove', this.onPointerMoveOnDrag, this);
        this.tile.on('pointerup', this.onPointerUpOnDrag, this);
        this.tile.on('pointerupoutside', this.onPointerUpOnDrag, this);

        this.dragStartPosition = new Point(this.tile.position.x, this.tile.position.y);
        this.dragStartTime = event.timeStamp;
        
        const parent = this.tile.parent ?? this.tile;
        const parentEventPosition = parent.toLocal(event.global);
        this.dragOffset.set(parentEventPosition.x - this.tile.position.x,
            parentEventPosition.y - this.tile.position.y);
        
        this.selectedTileLayer.attach(this.tile);
        this.addSelectedTileGlowFilter();
    }

    private onPointerMoveOnDrag(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }
        
        const parent = this.tile.parent ?? this.tile;
        const parentEventPosition = parent.toLocal(event.global);
        this.tile.position.set(parentEventPosition.x - this.dragOffset.x,
            parentEventPosition.y - this.dragOffset.y);
    }

    private onPointerUpOnDrag(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        this.selectedTileLayer.detach(this.tile);
        this.removeSelectedTileGlowFilter();

        this.tile.off('globalpointermove', this.onPointerMoveOnDrag, this);
        this.tile.off('pointerup', this.onPointerUpOnDrag, this);
        this.tile.off('pointerupoutside', this.onPointerUpOnDrag, this);
        
        this.isDragging = false;

        const tapWasExecuted
            = event.timeStamp - this.dragStartTime <= this.viewSettings.tapMaxDuration
            && Math.abs(this.tile.position.x - this.dragStartPosition.x)
                <= this.viewSettings.tapMaxDistance
            && Math.abs(this.tile.position.y - this.dragStartPosition.y)
                <= this.viewSettings.tapMaxDistance;

        if (tapWasExecuted) {
            this.tile.position.set(this.dragStartPosition.x, this.dragStartPosition.y);
            this.onPointerTap(event);
        } else {
            this.tile.on('pointerdown', this.onPointerDown, this);
        }
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        this.rotationAngleDifference = rotationAngleDifference;
        this.model.prepareToRotation(this.rotationAngleDifference);
        this.selectedTileLayer.attach(this.tile);
        
        if (!this.isDragging) {
            this.addSelectedTileGlowFilter();
        }
    }

    private executeRotation(deltaTime: number): void {
        this.model.executeRotation(deltaTime);
        this.tile.rotation = this.model.currentRotationAngle;
    }

    private completeRotation(): void {
        if (!this.isDragging) {
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

    public destroy(): void {
        this.ticker.remove(this.boundOnRotationTicker);
        this.tile.off('pointerdown', this.onPointerDown, this);
        this.tile.off('globalpointermove', this.onPointerMoveOnDrag, this);
        this.tile.off('pointerup', this.onPointerUpOnDrag, this);
        this.tile.off('pointerupoutside', this.onPointerUpOnDrag, this);
        this.tile.destroy();
    }
}