import { Point, Ticker } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { DraggableTileView } from "../views/tile-decorators/DraggableTileView.ts";
import { TileModel } from "../models/tiles/TileModel.ts";
import { draggingTileData } from "../views/tile-decorators/DraggingTileData.ts";

export class TileMoveAfterDragController {
    private readonly target: DraggableTileView;
    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(target: DraggableTileView, ticker: Ticker) {
        this.target = target;
        this.ticker = ticker;
    }

    public restart(dragTargetModel?: TileModel): void {
        const view = this.target.view;
        this.stop();
        
        const targetInTarget = dragTargetModel
            ? dragTargetModel.targetPositionPoint
            : this.target.initialContainer.getTilePositionPoint(
                view.model.targetTilePosition.shuffledIndex);
        
        let moveDifference: Point;
        if (view.tile.parent === this.target.selectedContainer) {
            const target = dragTargetModel
                ? this.target.targetContainer
                : this.target.initialContainer;
            const targetInGlobal = target.toGlobal(targetInTarget);
            const targetInSelected = this.target.selectedContainer.toLocal(targetInGlobal);            
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
        if (!this.target.view.model.getMoveIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
            this.target.isMoving = false;
        }
    }

    private start(moveDifference: Point): void {
        this.target.isMoving = true;
        this.target.setOnPointerDownActivity(false);
        this.prepareToExecute(moveDifference);        
        this.ticker.add(this.boundOnTicker);
    }

    private onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.target.view.model.getMoveIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            this.target.setOnPointerDownActivity(true);
        }        
    }

    private prepareToExecute(moveDifference: Point): void {
        draggingTileData.animatingViews.add(this.target);
        this.target.view.model.prepareToMove(moveDifference);

        if (this.target.view.tile.parent !== this.target.selectedContainer) {
            this.target.addTileToSelectedContainer();
        }

        const filter = new GlowFilter(this.target.parameters.selectedGlowFilterOptions);
        this.target.view.setFilter(filter);
    }

    private execute(deltaTime: number): void {
        const view = this.target.view;
        view.model.executeMove(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        this.target.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            this.target.getGlobalPosition(), this.target);
    }

    private complete(): void {
        const view = this.target.view;
        view.removeFilters();
        
        view.model.completeMove();
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        
        if (view.tile.parent !== this.target.targetContainer) {
            this.target.addTileToTargetContainer();
        }

        if (view.model.getIsLocatedCorrectly()) {
            this.target.fixAsLocatedCorrectly();
        }

        draggingTileData.animatingViews.delete(this.target);
        window.removeEventListener('wheel', this.target.boundPreventScrollOnWheel);

        this.target.isMoving = false;
    }

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}