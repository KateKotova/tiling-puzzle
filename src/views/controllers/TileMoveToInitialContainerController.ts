import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { EntityController } from "./EntityController.ts";
import { TileMoveController } from "../../models/controllers/TileMoveController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * координаты опорной точки которого меняются со временем
 * при перемещении к исходному контейнеру
 */
export class TileMoveToInitialContainerController
    extends EntityController<DraggableTileView, Point> {

    private readonly controller: TileMoveController;

    constructor(target: DraggableTileView, ticker: Ticker) {
        super(target, ticker);
        this.controller = this.target.view.model.moveController;
    }

    public restart(targetGlobalPosition: Point): void {
        this.stop();

        const globalPosition = this.target.getGlobalPosition();
        const moveDifference = new Point(
            targetGlobalPosition.x - globalPosition.x,
            targetGlobalPosition.y - globalPosition.y
        );

        this.start(moveDifference);
    }

    public stop(): void {
        if (!this.controller.getIsCompleted()) {
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
        if (this.controller.getIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            this.target.setOnPointerDownActivity(true);
        }        
    }

    protected prepareToExecute(moveDifference: Point): void {
        draggingTileData.animatingViews.add(this.target);
        this.controller.prepareToExecute(moveDifference);

        if (this.target.view.tile.parent !== this.target.selectedContainer) {
            this.target.addTileToSelectedContainer();
        }

        const filter = this.target.getSelectedGlowFilter();
        this.target.view.setFilter(filter);
    }

    protected execute(deltaTime: number): void {
        this.controller.execute(deltaTime);
        this.target.view.tile.position.copyFrom(
            this.target.view.model.currentPositionPoint);
        this.target.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            this.target.getGlobalPosition(), this.target);
    }

    protected complete(): void {
        const view = this.target.view;
        view.removeFilters();
        
        this.controller.complete();
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        
        if (view.tile.parent !== this.target.initialContainer) {
            this.target.addTileToContainer(this.target.initialContainer);
        }

        draggingTileData.animatingViews.delete(this.target);
        window.removeEventListener('wheel', this.target.boundPreventScrollOnWheel);

        this.target.isMoving = false;
    }
}