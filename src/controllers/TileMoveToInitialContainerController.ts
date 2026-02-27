import { Point, Ticker } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { DraggableTileView } from "../views/tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../views/tile-decorators/DraggingTileData.ts";

export class TileMoveToInitialContainerController {
    private readonly tileView: DraggableTileView;
    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(tileView: DraggableTileView, ticker: Ticker) {
        this.tileView = tileView;
        this.ticker = ticker;
    }

    public restart(targetGlobalPosition: Point): void {
        this.stop();

        const globalPosition = this.tileView.getGlobalPosition();
        const moveDifference = new Point(
            targetGlobalPosition.x - globalPosition.x,
            targetGlobalPosition.y - globalPosition.y
        );

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
        this.tileView.view.model.executeMove(deltaTime);
        this.tileView.view.tile.position.copyFrom(
            this.tileView.view.model.currentPositionPoint);
        this.tileView.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            this.tileView.getGlobalPosition(), this.tileView);
    }

    private complete(): void {
        const view = this.tileView.view;
        view.removeFilters();
        
        view.model.completeMove();
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        
        if (view.tile.parent !== this.tileView.initialContainer) {
            this.tileView.addTileToInitialContainer();
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