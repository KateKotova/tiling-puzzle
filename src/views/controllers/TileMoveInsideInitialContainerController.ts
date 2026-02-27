import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { EntityController } from "./EntityController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * координаты опорной точки которого меняются со временем
 * при перемещении внутри исходного контейнера
 */
export class TileMoveInsideInitialContainerController
    extends EntityController<DraggableTileView, Point> {

    public restart(targetPoint: Point): void {
        this.stop();
        
        const moveDifference = new Point(
            targetPoint.x - this.target.view.model.currentPositionPoint.x,
            targetPoint.y - this.target.view.model.currentPositionPoint.y
        );

        this.start(moveDifference);
    }

    public stop(): void {
        if (!this.target.view.model.getMoveIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
            this.target.isMoving = false;
        }
    }

    public start(moveDifference: Point): void {
        this.target.isMoving = true;
        this.target.setOnPointerDownActivity(false);
        this.prepareToExecute(moveDifference);        
        this.ticker.add(this.boundOnTicker);
    }

    protected onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.target.view.model.getMoveIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            this.target.setOnPointerDownActivity(true);
        }        
    }

    protected prepareToExecute(moveDifference: Point): void {
        this.target.view.model.prepareToMove(moveDifference);
    }

    protected execute(deltaTime: number): void {
        const view = this.target.view;
        view.model.executeMove(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
    }

    protected complete(): void {
        this.target.view.model.completeMove();
        this.target.view.tile.position.copyFrom(
            this.target.view.model.currentPositionPoint);
        this.target.isMoving = false;
    }
}