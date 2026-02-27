import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../views/tile-decorators/DraggableTileView.ts";
import { TileModel } from "../models/tiles/TileModel.ts";
import { draggingTileData } from "../views/tile-decorators/DraggingTileData.ts";
import { GlowFilter } from "pixi-filters";

export class TileMoveAfterDragController {
    private readonly tileView: DraggableTileView;
    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(tileView: DraggableTileView, ticker: Ticker) {
        this.tileView = tileView;
        this.ticker = ticker;
    }

    public restart(dragTargetModel?: TileModel): void {
        const view = this.tileView.view;
        this.stop();
        
        const targetInTarget = dragTargetModel
            ? dragTargetModel.targetPositionPoint
            : this.tileView.initialContainer.getTilePositionPoint(
                view.model.targetTilePosition.shuffledIndex);
        
        let moveDifference: Point;
        if (view.tile.parent === this.tileView.selectedContainer) {
            const target = dragTargetModel
                ? this.tileView.targetContainer
                : this.tileView.initialContainer;
            const targetInGlobal = target.toGlobal(targetInTarget);
            const targetInSelected = this.tileView.selectedContainer.toLocal(targetInGlobal);            
            moveDifference = new Point(
                targetInSelected.x - view.model.currentPositionPoint.x,
                targetInSelected.y - view.model.currentPositionPoint.y
            );
        } else {
            moveDifference = new Point(
                targetInTarget.x - view.model.currentPositionPoint.x,
                targetInTarget.y - view.model.currentPositionPoint.y
            );
        }

        this.start(moveDifference);
    }

    private stop(): void {
        if (!this.tileView.view.model.getMoveIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
            this.tileView.isMoving = false;
        }
    }

    private start(moveDifference: Point): void {
        this.tileView.isMoving = true;
        this.tileView.setOnPointerDownActivity(false);
        this.prepareToExecute(moveDifference);        
        this.ticker.add(this.boundOnTicker);
    }

    private onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.tileView.view.model.getMoveIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            this.tileView.setOnPointerDownActivity(true);
        }        
    }

    private prepareToExecute(moveDifference: Point): void {
        draggingTileData.animatingViews.add(this.tileView);
        this.tileView.view.model.prepareToMove(moveDifference);

        if (this.tileView.view.tile.parent !== this.tileView.selectedContainer) {
            this.tileView.addTileToSelectedContainer();
        }

        const filter = new GlowFilter(this.tileView.parameters.selectedGlowFilterOptions);
        this.tileView.view.setFilter(filter);
    }

    private execute(deltaTime: number): void {
        const view = this.tileView.view;
        view.model.executeMove(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        this.tileView.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            this.tileView.getGlobalPosition(), this.tileView);
    }

    private complete(): void {
        const view = this.tileView.view;
        view.removeFilters();
        
        view.model.completeMove();
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        
        if (view.tile.parent !== this.tileView.targetContainer) {
            this.tileView.addTileToTargetContainer();
        }

        if (view.model.getIsLocatedCorrectly()) {
            this.tileView.fixAsLocatedCorrectly();
        }

        draggingTileData.animatingViews.delete(this.tileView);
        window.removeEventListener('wheel', this.tileView.boundPreventScrollOnWheel);

        this.tileView.isMoving = false;
    }

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}