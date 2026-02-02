import { Texture, Container, Point, Ticker, FederatedPointerEvent, Filter } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "./TileView.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { AdditionalMath } from "../../models/math/AdditionalMath.ts";
import { StaticTileView } from "./StaticTileView.ts";
import { DraggingTileData } from "./DraggingTileData.ts";

export class DragableTileView implements TileView {
    private viewSettings: ViewSettings;
    public view: TileView;
    private parentContainer: Container | null;
    private selectedTileContainer: Container;
    private ticker: Ticker;
    private isDragging: boolean = false;
    private dragOffset: Point = new Point(0, 0);
    private dragStartPosition: Point = new Point(0, 0);
    private dragStartTime: number = 0;
    private draggingTileData: DraggingTileData;
    public dragSource: StaticTileView | null = null;
    public dragTarget: StaticTileView | null = null;
    private onPointerDownIsActive: boolean = true;

    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);
    private boundOnMoveTicker: (ticker: Ticker) => void = this.onMoveTicker.bind(this);
    private boundGlobalPointerUp: (event: PointerEvent) => void
        = this.onGlobalPointerUp.bind(this);

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

    public setOnPointerDownActivity(isActive: boolean) {
        if ((isActive && this.onPointerDownIsActive)
            || (!isActive && !this.onPointerDownIsActive)) {
            return;
        }
        this.onPointerDownIsActive = isActive;
        if (isActive) {
            this.view.tile.on('pointerdown', this.onPointerDown, this);
        } else {
            this.view.tile.off('pointerdown', this.onPointerDown, this);
        }
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
            this.setOnPointerDownActivity(true);
        }        
    }

    private onMoveTicker(ticker: Ticker) {
        this.executeMove(ticker.deltaMS);
        if (this.view.model.getMoveIsCompleted()) {
            this.completeMove();
            this.ticker.remove(this.boundOnMoveTicker);
            this.setOnPointerDownActivity(true);
        }        
    }

    public rotateToDragTarget(dragTargetModel: TileModel): void {
        const rotationAngleDifference = this.view.model.getNewPositionMinAngleDifference(
            dragTargetModel.rotationAngle);
        this.startRotation(rotationAngleDifference);
    }

    public moveToStaticTile(staticTileModel: TileModel): void {
        //this.view.model.currentPositionPoint.x += -this.dragOffset.x - this.view.model.pivotPoint.x;
        //this.view.model.currentPositionPoint.y += -this.dragOffset.y - this.view.model.pivotPoint.y;
        const moveDifference = new Point(
            staticTileModel.currentPositionPoint.x
                - this.view.model.currentPositionPoint.x,
            staticTileModel.currentPositionPoint.y
                - this.view.model.currentPositionPoint.y);
        this.startMove(moveDifference);
    }

    private startRotation(rotationAngleDifference: number): void {
        this.setOnPointerDownActivity(false);
        this.prepareToRotation(rotationAngleDifference);
        this.ticker.add(this.boundOnRotationTicker);
    }

    private startMove(moveDifference: Point): void {
        this.setOnPointerDownActivity(false);
        this.prepareToMove(moveDifference);
        this.ticker.add(this.boundOnMoveTicker);
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        this.view.model.prepareToRotation(rotationAngleDifference);
        this.selectedTileContainer.addChild(this.view.tile);
        
        if (!this.isDragging) {
            this.view.setFilter(this.viewSettings.selectedTileGlowFilter);
        }
    }

    private prepareToMove(moveDifference: Point): void {
        this.view.model.prepareToMove(moveDifference);
        this.view.setFilter(this.viewSettings.selectedTileGlowFilter);
    }

    private executeRotation(deltaTime: number): void {
        this.view.model.executeRotation(deltaTime);
        this.view.tile.rotation = this.view.model.currentRotationAngle;
    }

    private executeMove(deltaTime: number): void {
        this.view.model.executeMove(deltaTime);
        this.view.tile.position = this.view.model.currentPositionPoint.clone();
    }

    private completeRotation(): void {
        if (!this.isDragging) {
            this.view.removeFilters();
        }

        this.addTileToParentContainer();
        this.view.model.completeRotation();
        this.view.tile.rotation = this.view.model.currentRotationAngle;
    }

    private completeMove(): void {
        this.view.removeFilters();
        this.addTileToParentContainer();
        this.view.model.completeMove();
        this.view.tile.position = this.view.model.currentPositionPoint.clone();
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        this.isDragging = true;

        this.setOnPointerDownActivity(false);
        this.view.tile.on('globalpointermove', this.onPointerMove, this);
        window.addEventListener('pointerup', this.boundGlobalPointerUp);

        this.dragStartPosition = this.view.tile.position.clone();
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
        this.view.model.currentPositionPoint.set(parentEventPosition.x - this.dragOffset.x,
            parentEventPosition.y - this.dragOffset.y);
        this.view.tile.position = this.view.model.currentPositionPoint.clone();

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

    public onGlobalPointerUp(event: PointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;

        const federatedPointerEvent = event as FederatedPointerEvent;
        if (this.dragTarget) {
            this.dragTarget.onPointerUp(federatedPointerEvent);
        } else if (this.dragSource) {
            this.dragSource.onPointerUp(federatedPointerEvent);
        }

        const moveTargetModel = this.dragTarget?.model ?? this.dragSource?.model;
        if (moveTargetModel) {
            this.moveToStaticTile(moveTargetModel);
            this.rotateToDragTarget(moveTargetModel);
        } else {
            this.setOnPointerDownActivity(true);
            this.addTileToParentContainer();
            this.view.removeFilters();
        }

        if (!this.dragSource) {
            this.dragSource = this.dragTarget;
        }

        if (this.dragTarget) {
            this.dragSource = this.dragTarget;
        }
        this.dragTarget = null;
        this.draggingTileData.view = null;

        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);
        
        const tapWasExecuted
            = (event.timeStamp - this.dragStartTime <= this.viewSettings.tapMaxDuration)
            && Math.abs(this.view.tile.position.x - this.dragStartPosition.x)
                <= this.viewSettings.tapMaxDistance
            && Math.abs(this.view.tile.position.y - this.dragStartPosition.y)
                <= this.viewSettings.tapMaxDistance;

        if (tapWasExecuted) {
            this.view.model.currentPositionPoint.set(this.dragStartPosition.x,
                this.dragStartPosition.y);
            this.view.tile.position = this.view.model.currentPositionPoint.clone();
            this.onPointerTap(event);
        } else {
            this.setOnPointerDownActivity(true);
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
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);
        this.view.destroy();
    }
}