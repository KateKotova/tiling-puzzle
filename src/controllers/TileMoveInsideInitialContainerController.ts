import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../views/tile-decorators/DraggableTileView.ts";

export class TileMoveInsideInitialContainerController {
    private readonly tileView: DraggableTileView;
    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(tileView: DraggableTileView, ticker: Ticker) {
        this.tileView = tileView;
        this.ticker = ticker;
    }

    public restart(targetPoint: Point): void {
        this.stop();
        
        const moveDifference = new Point(
            targetPoint.x - this.tileView.view.model.currentPositionPoint.x,
            targetPoint.y - this.tileView.view.model.currentPositionPoint.y
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
        this.tileView.view.model.prepareToMove(moveDifference);
    }

    private execute(deltaTime: number): void {
        const view = this.tileView.view;
        view.model.executeMove(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
    }

    private complete(): void {
        this.tileView.view.model.completeMove();
        this.tileView.view.tile.position.copyFrom(
            this.tileView.view.model.currentPositionPoint);
        this.tileView.isMoving = false;
    }

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}