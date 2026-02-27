import { Ticker } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../models/tiles/TileModel.ts";
import { DraggableTileView } from "../views/tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../views/tile-decorators/DraggingTileData.ts";

export class TileRotationController {
    private readonly tileView: DraggableTileView;
    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(tileView: DraggableTileView, ticker: Ticker) {
        this.tileView = tileView;
        this.ticker = ticker;
    }

    public restart(dragTargetModel?: TileModel): void {
        this.stop();
        const rotationAngle = dragTargetModel
            ? dragTargetModel.targetRotationAngle
            : Math.random() * 2 * Math.PI;
        const rotationAngleDifference = this.tileView.view.model
            .getNewPositionMinAngleDifference(rotationAngle);
        this.start(rotationAngleDifference);
    }

    public stop(): void {
        if (!this.tileView.view.model.getRotationIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
        }
    }

    public start(rotationAngleDifference: number): void {
        this.tileView.setOnPointerDownActivity(false);
        this.prepareToExecute(rotationAngleDifference);        
        this.ticker.add(this.boundOnTicker);
    }

    private onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.tileView.view.model.getRotationIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            this.tileView.setOnPointerDownActivity(true);
        }        
    }

    private prepareToExecute(rotationAngleDifference: number): void {
        draggingTileData.animatingViews.add(this.tileView);
        this.tileView.view.model.prepareToRotation(rotationAngleDifference);
        this.tileView.addTileToSelectedContainer();
        
        if (!this.tileView.isDragging) {
            const filter = new GlowFilter(this.tileView.parameters.selectedGlowFilterOptions);
            this.tileView.view.setFilter(filter);
        }
    }

    private execute(deltaTime: number): void {
        this.tileView.view.model.executeRotation(deltaTime);
        this.tileView.view.tile.rotation = this.tileView.view.model.currentRotationAngle;
    }

    private complete(): void {
        const view = this.tileView.view;
        if (!this.tileView.isDragging) {
            view.removeFilters();
        }
        
        view.model.completeRotation();
        
        view.tile.rotation = view.model.currentRotationAngle;
        
        if (
            !this.tileView.isDragging
            && view.tile.parent !== this.tileView.targetContainer
        ) {
            this.tileView.addTileToTargetContainer();
        }

        if (view.model.getIsLocatedCorrectly()) {
            this.tileView.fixAsLocatedCorrectly();
        }

        if (!this.tileView.isDragging && !this.tileView.isMoving) {
            draggingTileData.animatingViews.delete(this.tileView);
            window.removeEventListener('wheel', this.tileView.boundPreventScrollOnWheel);
        }
    }

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}