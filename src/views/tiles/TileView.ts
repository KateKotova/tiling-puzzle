import {
    Color,
    Container,
    FederatedPointerEvent,
    Filter,
    Point,
    Renderer,
    Texture,
    Ticker
} from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { BevelFilter } from "pixi-filters";
import { ViewSettings } from "../ViewSettings.ts";
import { TileViewParameters } from "./TileViewParameters.ts";
import { DraggingTileData } from "./DraggingTileData.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { AdditionalMath } from "../../models/geometry/AdditionalMath.ts";

export abstract class TileView {
    protected viewSettings: ViewSettings;
    public model: TileModel;
    public texture: Texture | null;
    public tile: Container;
    public content: Container;
    private parentContainer: Container | null;
    private selectedTileContainer: Container;
    private rotationAngleDifference: number = 0;
    private ticker: Ticker;
    private isDragable: boolean;
    private isDragging: boolean = false;
    private hasDragTarget: boolean = false;
    private isDragTarget: boolean = false;
    private dragOffset: Point = new Point();
    private dragStartPosition: Point = new Point();
    public dragStartEmptyTileView: TileView | null = null;
    private dragStartTime: number = 0;
    private draggingTileData: DraggingTileData;

    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);
    
    constructor (parameters: TileViewParameters) {
        this.viewSettings = parameters.viewSettings;
        this.model = parameters.model;
        this.texture = parameters.texture;
        this.isDragable = !!this.texture;
        this.content = this.createContent(parameters.renderer,
            parameters.replacingTextureFillColor);
        this.tile = this.createTile();
        this.parentContainer = this.tile.parent;
        this.selectedTileContainer = parameters.selectedTileContainer;
        this.ticker = parameters.ticker;
        this.draggingTileData = parameters.draggingTileData;

        this.tile.eventMode = "static";
        if (this.isDragable) {
            this.tile.on('pointerdown', this.onPointerDownOnDrag, this);
        } else {
            this.tile.on('pointerenter', this.onPointerEnterOnDragableMove, this);
            this.tile.on('pointerdown', this.onPointerEnterOnDragableMove, this);
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
                + (this.isDragable ? 0 : 180)
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

        this.tile.off('pointerdown', this.onPointerDownOnDrag, this);
        const rotationAngleDifference = this.model.getSamePositionNextAngleMinAngleDifference();
        this.prepareToRotation(rotationAngleDifference);
        this.ticker.add(this.boundOnRotationTicker);
    }

    private onRotationTicker(ticker: Ticker) {
        this.executeRotation(ticker.deltaMS);
        if (this.model.getRotaionIsCompleted()) {
            this.completeRotation();
            this.ticker.remove(this.boundOnRotationTicker);
            this.tile.on('pointerdown', this.onPointerDownOnDrag, this);
        }        
    }

    private getDraggingTileHasTheSameType(): boolean {
        if (!this.draggingTileData.view?.model
            || this.draggingTileData.view.model.tileType != this.model.tileType) {
            return false;
        }

        if (this.draggingTileData.view.model instanceof RegularPolygonTileModel) {
            const draggingModel = this.draggingTileData.view.model as RegularPolygonTileModel;
            if (!(this.model instanceof RegularPolygonTileModel)) {
                return false;
            }
            const model = this.model as RegularPolygonTileModel;
            if (draggingModel.sideCount != model.sideCount) {
                return false;
            }
        }

        return true;
    }

    private rotateToDragTarget(dragTargetModel: TileModel): void {
        this.tile.off('pointerdown', this.onPointerDownOnDrag, this);
        const rotationAngleDifference = this.model.getNewPositionMinAngleDifference(
            dragTargetModel.rotationAngle);
        this.prepareToRotation(rotationAngleDifference);
        this.ticker.add(this.boundOnRotationTicker);
    }

    private onPointerEnterOnDragableMove(): void {
        if (this.isDragTarget || !this.getDraggingTileHasTheSameType()) {
            return;
        }

        this.isDragTarget = true;
        if (this.draggingTileData.view) {
            this.draggingTileData.view.hasDragTarget = true;
        }        
        this.addFilter(this.viewSettings.targetEmptyTileGlowFilter);

        this.tile.off('pointerenter', this.onPointerEnterOnDragableMove, this);
        this.tile.off('pointerdown', this.onPointerEnterOnDragableMove, this);
        this.tile.on('pointerleave', this.onPointerLeaveOnDragableMove, this);
        this.tile.on('pointerup', this.onPointerUpOnDragableMove, this);

        this.draggingTileData.view?.rotateToDragTarget(this.model);
    }

    private onPointerLeaveOnDragableMove(): void {
        if (!this.isDragTarget) {
            return;
        }

        this.isDragTarget = false;
        if (this.draggingTileData.view) {
            this.draggingTileData.view.hasDragTarget = false;
        }
        this.removeFilters();

        this.tile.on('pointerenter', this.onPointerEnterOnDragableMove, this);
        this.tile.on('pointerdown', this.onPointerEnterOnDragableMove, this);
        this.tile.off('pointerleave', this.onPointerLeaveOnDragableMove, this);
        this.tile.off('pointerup', this.onPointerUpOnDragableMove, this);
    }

    // TODO: продолжить работу, это только копия
    private onPointerUpOnDragableMove(): void {
        if (!this.isDragTarget) {
            return;
        }

        this.isDragTarget = false;
        if (this.draggingTileData.view) {
            this.draggingTileData.view.hasDragTarget = false;
            this.draggingTileData.view.dragStartEmptyTileView = this;
        }

        this.removeFilters();

        this.tile.on('pointerenter', this.onPointerEnterOnDragableMove, this);
        this.tile.on('pointerdown', this.onPointerEnterOnDragableMove, this);
        this.tile.off('pointerleave', this.onPointerLeaveOnDragableMove, this);
        this.tile.off('pointerup', this.onPointerUpOnDragableMove, this);
    }

    private onPointerDownOnDrag(event: FederatedPointerEvent): void {
        this.isDragging = true;

        this.tile.off('pointerdown', this.onPointerDownOnDrag, this);
        this.tile.on('globalpointermove', this.onPointerMoveOnDrag, this);
        this.tile.on('pointerup', this.onPointerUpOnDrag, this);
        this.tile.on('pointerupoutside', this.onPointerUpOnDrag, this);

        this.dragStartPosition = new Point(this.tile.position.x, this.tile.position.y);
        this.dragStartTime = event.timeStamp;
        this.draggingTileData.view = this;
        
        const parent = this.tile.parent ?? this.tile;
        const parentEventPosition = parent.toLocal(event.global);
        this.dragOffset.set(parentEventPosition.x - this.tile.position.x,
            parentEventPosition.y - this.tile.position.y);
        
        this.selectedTileContainer.addChild(this.tile);
        this.addFilter(this.viewSettings.selectedTileGlowFilter);
    }

    private onPointerMoveOnDrag(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }
        
        const parent = this.tile.parent ?? this.tile;
        const parentEventPosition = parent.toLocal(event.global);
        this.tile.position.set(parentEventPosition.x - this.dragOffset.x,
            parentEventPosition.y - this.dragOffset.y);

        if (this.dragStartEmptyTileView) {
            const hitArea = this.dragStartEmptyTileView.model.absoluteBoundingRectangle;
            const pointerIsInHitArea = AdditionalMath.getPointIsInsideRectangle(
                parentEventPosition, hitArea);
            if (!this.hasDragTarget && pointerIsInHitArea) {
                this.dragStartEmptyTileView.onPointerEnterOnDragableMove();
            } else if (this.hasDragTarget && !pointerIsInHitArea) {
                this.dragStartEmptyTileView.onPointerLeaveOnDragableMove();
            }
        }
    }

    private onPointerUpOnDrag(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        this.draggingTileData.view = null;

        this.parentContainer?.addChild(this.tile);
        this.removeFilters();

        this.tile.off('globalpointermove', this.onPointerMoveOnDrag, this);
        this.tile.off('pointerup', this.onPointerUpOnDrag, this);
        this.tile.off('pointerupoutside', this.onPointerUpOnDrag, this);
        
        this.isDragging = false;
        this.hasDragTarget = false;

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
            this.tile.on('pointerdown', this.onPointerDownOnDrag, this);
        }
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        this.rotationAngleDifference = rotationAngleDifference;
        this.model.prepareToRotation(this.rotationAngleDifference);
        this.selectedTileContainer.addChild(this.tile);
        
        if (!this.isDragging) {
            this.addFilter(this.viewSettings.selectedTileGlowFilter);
        }
    }

    private executeRotation(deltaTime: number): void {
        this.model.executeRotation(deltaTime);
        this.tile.rotation = this.model.currentRotationAngle;
    }

    private completeRotation(): void {
        if (!this.isDragging) {
            this.removeFilters();
        }

        this.parentContainer?.addChild(this.tile);
        this.model.completeRotation();
        this.tile.rotation = this.model.currentRotationAngle;
    }

    private addFilter(filter: Filter): void {
        this.content.filters = [filter];
        this.content.updateCacheTexture();
    }

    private removeFilters(): void {
        this.content.filters = [];
        this.content.updateCacheTexture();
    }

    public destroy(): void {
        this.ticker.remove(this.boundOnRotationTicker);
        this.tile.off('pointerdown', this.onPointerDownOnDrag, this);
        this.tile.off('globalpointermove', this.onPointerMoveOnDrag, this);
        this.tile.off('pointerup', this.onPointerUpOnDrag, this);
        this.tile.off('pointerupoutside', this.onPointerUpOnDrag, this);
        this.tile.off('pointerenter', this.onPointerEnterOnDragableMove, this);
        this.tile.off('pointerdown', this.onPointerEnterOnDragableMove, this);
        this.tile.off('pointerleave', this.onPointerLeaveOnDragableMove, this);
        this.tile.off('pointerup', this.onPointerUpOnDragableMove, this);        
        this.tile.destroy();
    }
}