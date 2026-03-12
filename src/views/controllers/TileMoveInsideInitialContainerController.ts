import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { EntityController } from "./EntityController.ts";
import { TileMoveController } from "../../models/controllers/TileMoveController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * координаты опорной точки которого меняются со временем
 * при перемещении внутри исходного контейнера
 */
export class TileMoveInsideInitialContainerController
    extends EntityController<DraggableTileView, Point> {

    private readonly controller: TileMoveController;

    constructor(target: DraggableTileView, ticker: Ticker) {
        super(target, ticker);
        this.controller = this.target.view.model.moveController;
    }

    protected get staticTickerListenersCount(): number {
        return TileMoveInsideInitialContainerController.onTickerCount;
    }

    protected set staticTickerListenersCount(value: number) {
        TileMoveInsideInitialContainerController.onTickerCount = value;
    }

    public restart(targetPoint: Point): void {
        this.stop();
        
        const moveDifference = new Point(
            targetPoint.x - this.target.view.model.currentPositionPoint.x,
            targetPoint.y - this.target.view.model.currentPositionPoint.y
        );

        this.start(moveDifference);
    }

    public stop(): void {
        this.removeTickerListener();
        this.target.isMoving = false;
    }

    public start(moveDifference: Point): void {
        this.removeTickerListener();
        this.target.isMoving = true;
        this.target.setOnPointerDownActivity(false);
        this.prepareToExecute(moveDifference);        
        this.addTickerListener();
    }

    protected onTicker(): void {
        this.execute(this.ticker.deltaMS);
        if (this.controller.getIsCompleted()) {
            this.complete();
            this.removeTickerListener();
            this.target.setOnPointerDownActivity(true);
        }        
    }

    protected prepareToExecute(moveDifference: Point): void {
        this.controller.prepareToExecute(moveDifference);
    }

    protected execute(deltaTime: number): void {
        const view = this.target.view;
        this.controller.execute(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
    }

    protected complete(): void {
        this.controller.complete();
        this.target.view.tile.position.copyFrom(
            this.target.view.model.currentPositionPoint);
        this.target.isMoving = false;
    }
}