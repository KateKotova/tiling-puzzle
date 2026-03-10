import { Point, Ticker } from "pixi.js";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { EntityController } from "./EntityController.ts";
import { TileMoveController } from "../../models/controllers/TileMoveController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * координаты опорной точки которого меняются со временем
 * при перемещении после попытки перемещения в область изображения
 */
export class TileMoveAfterDragController
    extends EntityController<DraggableTileView, Point> {

    private readonly controller: TileMoveController;
    private hasDragTarget: boolean = false;

    constructor(target: DraggableTileView, ticker: Ticker) {
        super(target, ticker);
        this.controller = this.target.view.model.moveController;
    }

    public restart(dragTargetModel?: TileModel): void {
        const view = this.target.view;
        this.stop();
        
        this.hasDragTarget = !!dragTargetModel;
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
        draggingTileData.animatingViews.add(this.target);
        this.controller.prepareToExecute(moveDifference);

        if (this.target.view.tile.parent !== this.target.selectedContainer) {
            this.target.addTileToSelectedContainer();
        }

        const filter = this.target.getSelectedGlowFilter();
        this.target.view.setFilter(filter);
    }

    protected execute(deltaTime: number): void {
        const view = this.target.view;
        this.controller.execute(deltaTime);
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        this.target.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            this.target.getGlobalPosition(), this.target);
    }

    protected complete(): void {
        const view = this.target.view;
        view.removeFilters();
        
        this.controller.complete();
        view.tile.position.copyFrom(view.model.currentPositionPoint);
        
        const targetContainer = this.hasDragTarget
            ? this.target.targetContainer
            : this.target.initialContainer;
        if (view.tile.parent !== targetContainer) {
            this.target.addTileToContainer(targetContainer);
        }

        if (view.model.getIsLocatedCorrectly()) {
            this.target.fixAsLocatedCorrectly();
        }

        draggingTileData.animatingViews.delete(this.target);
        window.removeEventListener('wheel', this.target.boundPreventScrollOnWheel);

        this.target.isMoving = false;
    }
}