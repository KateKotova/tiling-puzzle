import { Texture, Container, Point, Ticker, FederatedPointerEvent, Filter } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "./TileView.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { AdditionalMath } from "../../models/geometry/AdditionalMath.ts";
import { StaticTileView } from "./StaticTileView.ts";
import { DraggingTileData } from "./DraggingTileData.ts";

export class DragableTileView implements TileView {
    private viewSettings: ViewSettings;
    public view: TileView;
    private parentContainer: Container | null;
    private selectedTileContainer: Container;
    private ticker: Ticker;
    private isDragging: boolean = false;
    private dragOffset: Point = new Point();
    private dragStartPosition: Point = new Point();
    private dragStartTime: number = 0;
    private draggingTileData: DraggingTileData;
    public dragSource: StaticTileView | null = null;
    public dragTarget: StaticTileView | null = null;

    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);

    constructor (viewSettings: ViewSettings,
        view: TileView,
        selectedTileContainer: Container,
        ticker: Ticker,
        draggingTileData: DraggingTileData) {
            
        this.viewSettings = viewSettings;
        this.view = view;
        this.parentContainer = this.view.tile.parent;
        this.selectedTileContainer = selectedTileContainer;
        this.ticker = ticker;
        this.draggingTileData = draggingTileData;

        this.view.tile.eventMode = "static";
        this.view.tile.on('pointerdown', this.onPointerDown, this);
    }

    public get model(): TileModel {
        return this.view.model;
    }

    public get texture(): Texture | null {
        return this.view.texture;
    }

    public get tile(): Container {
        return this.view.tile;
    }

    public get content(): Container {
        return this.view.content;
    }

    public setFilter(filter: Filter): void {
        this.view.setFilter(filter);
    }
    
    public removeFilters(): void {
        this.view.removeFilters();
    }

    private onPointerTap(event: PointerEvent): void {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        const rotationAngleDifference = this.view.model
            .getSamePositionNextAngleMinAngleDifference();
        this.startRotation(rotationAngleDifference);
    }

    private onRotationTicker(ticker: Ticker) {
        this.executeRotation(ticker.deltaMS);
        if (this.view.model.getRotaionIsCompleted()) {
            this.completeRotation();
            this.ticker.remove(this.boundOnRotationTicker);
            this.view.tile.on('pointerdown', this.onPointerDown, this);
        }        
    }

    public rotateToDragTarget(dragTargetModel: TileModel): void {
        const rotationAngleDifference = this.view.model.getNewPositionMinAngleDifference(
            dragTargetModel.rotationAngle);
        this.startRotation(rotationAngleDifference);
    }

    private startRotation(rotationAngleDifference: number): void {
        this.view.tile.off('pointerdown', this.onPointerDown, this);
        this.prepareToRotation(rotationAngleDifference);
        this.ticker.add(this.boundOnRotationTicker);
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        this.view.model.prepareToRotation(rotationAngleDifference);
        this.selectedTileContainer.addChild(this.view.tile);
        
        if (!this.isDragging) {
            this.view.setFilter(this.viewSettings.selectedTileGlowFilter);
        }
    }

    private executeRotation(deltaTime: number): void {
        this.view.model.executeRotation(deltaTime);
        this.view.tile.rotation = this.view.model.currentRotationAngle;
    }

    private completeRotation(): void {
        if (!this.isDragging) {
            this.view.removeFilters();
        }

        this.addTileToParentContainer();
        this.view.model.completeRotation();
        this.view.tile.rotation = this.view.model.currentRotationAngle;
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        this.isDragging = true;

        this.view.tile.off('pointerdown', this.onPointerDown, this);
        this.view.tile.on('globalpointermove', this.onPointerMove, this);
        this.view.tile.on('pointerup', this.onPointerUp, this);
        this.view.tile.on('pointerupoutside', this.onPointerUp, this);

        this.dragStartPosition = new Point(this.view.tile.position.x, this.view.tile.position.y);
        this.dragStartTime = event.timeStamp;
        this.draggingTileData.view = this;
        
        const parent = this.view.tile.parent ?? this.view.tile;
        const parentEventPosition = parent.toLocal(event.global);
        this.dragOffset.set(parentEventPosition.x - this.view.tile.position.x,
            parentEventPosition.y - this.view.tile.position.y);
        
        this.selectedTileContainer.addChild(this.view.tile);
        this.view.setFilter(this.viewSettings.selectedTileGlowFilter);
    }

    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }
        
        const parent = this.view.tile.parent ?? this.view.tile;
        const parentEventPosition = parent.toLocal(event.global);
        this.view.tile.position.set(parentEventPosition.x - this.dragOffset.x,
            parentEventPosition.y - this.dragOffset.y);

        if (this.dragSource) {
            const dragSourceSimpleHintArea = this.dragSource.view.model.absoluteBoundingRectangle;
            const pointerIsInHitArea = AdditionalMath.getPointIsInsideRectangle(
                parentEventPosition, dragSourceSimpleHintArea);
            if (!this.dragTarget && pointerIsInHitArea) {
                this.dragSource.onPointerEnter();
            } else if (this.dragTarget && !pointerIsInHitArea) {
                this.dragSource.onPointerLeave();
            }
        }
    }

    // TODO: continue to improve
    private onPointerUp(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;

        if (this.dragTarget && this.dragTarget == this.dragSource) {
            this.dragSource.onPointerUp();
        }

        this.dragSource = this.dragTarget;
        this.dragTarget = null;
        this.draggingTileData.view = null;

        this.addTileToParentContainer();
        this.view.removeFilters();

        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        this.view.tile.off('pointerup', this.onPointerUp, this);
        this.view.tile.off('pointerupoutside', this.onPointerUp, this);
        
        const tapWasExecuted
            = event.timeStamp - this.dragStartTime <= this.viewSettings.tapMaxDuration
            && Math.abs(this.view.tile.position.x - this.dragStartPosition.x)
                <= this.viewSettings.tapMaxDistance
            && Math.abs(this.view.tile.position.y - this.dragStartPosition.y)
                <= this.viewSettings.tapMaxDistance;

        if (tapWasExecuted) {
            this.view.tile.position.set(this.dragStartPosition.x, this.dragStartPosition.y);
            this.onPointerTap(event);
        } else {
            this.view.tile.on('pointerdown', this.onPointerDown, this);
        }
    }

    private addTileToParentContainer() {
        if (this.parentContainer) {
            this.parentContainer?.addChild(this.view.tile);
        } else {
            this.selectedTileContainer.removeChild(this.view.tile);
        }
    }

    public destroy(): void {
        this.ticker.remove(this.boundOnRotationTicker);
        this.view.tile.off('pointerdown', this.onPointerDown, this);
        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        this.view.tile.off('pointerup', this.onPointerUp, this);
        this.view.tile.off('pointerupoutside', this.onPointerUp, this);
        this.view.destroy();
    }
}