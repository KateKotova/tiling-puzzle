import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../views/tile-decorators/DraggableTileView.ts";

export class TileMoveInsideInitialContainerController {
    private readonly target: DraggableTileView;
    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(target: DraggableTileView, ticker: Ticker) {
        this.target = target;
        this.ticker = ticker;
    }

    public restart(targetPoint: Point): void {
        this.stop();
        
        const moveDifference = new Point(
            targetPoint.x - this.target.view.model.currentPositionPoint.x,
            targetPoint.y - this.target.view.model.currentPositionPoint.y
        );

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
        this.target.view.model.prepareToMove(moveDifference);
    }

    private execute(deltaTime: number): void {
        const view = this.target.view;
        view.model.executeMove(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
    }

    private complete(): void {
        this.target.view.model.completeMove();
        this.target.view.tile.position.copyFrom(
            this.target.view.model.currentPositionPoint);
        this.target.isMoving = false;
    }

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}