import { Ticker } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { EntityController } from "./EntityController.ts";
import { TileRotationController as TileRotationModelController}
    from "../../models/controllers/TileRotationController.ts";
import { WheelController } from "./WheelController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * угол поворота вокруг опорной точки которого меняется со временем
 */
export class TileRotationController extends EntityController<DraggableTileView, number> {
    private readonly controller: TileRotationModelController;
    public hasDragTarget: boolean = false;

    constructor(target: DraggableTileView, ticker: Ticker) {
        super(target, ticker);
        this.controller = this.target.view.model.rotationController;
    }

    protected get staticTickerListenersCount(): number {
        return TileRotationController.onTickerCount;
    }

    protected set staticTickerListenersCount(value: number) {
        TileRotationController.onTickerCount = value;
    }

    public restart(dragTargetModel?: TileModel): void {
        this.stop();
        this.hasDragTarget = !!dragTargetModel;
        const rotationAngle = dragTargetModel
            ? dragTargetModel.targetRotationAngle
            : Math.random() * 2 * Math.PI;
        const rotationAngleDifference = this.target.view.model
            .getNewPositionMinAngleDifference(rotationAngle);
        this.start(rotationAngleDifference);
    }

    public stop(): void {
        this.removeTickerListener();
    }

    public start(rotationAngleDifference: number): void {
        this.removeTickerListener();
        this.target.setOnPointerDownActivity(false);
        this.prepareToExecute(rotationAngleDifference);        
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

    protected prepareToExecute(rotationAngleDifference: number): void {
        draggingTileData.animatingViews.add(this.target);
        this.controller.prepareToExecute(rotationAngleDifference);
        this.target.addTileToSelectedContainer();
        
        if (!this.target.isDragging) {
            const filter = this.target.getSelectedGlowFilter();
            this.target.view.setFilter(filter);
        }
    }

    protected execute(deltaTime: number): void {
        this.controller.execute(deltaTime);
        this.target.view.tile.rotation = this.target.view.model.currentRotationAngle;
    }

    protected complete(): void {
        const view = this.target.view;
        if (!this.target.isDragging) {
            view.removeFilters();
        }
        
        this.controller.complete();
        
        view.tile.rotation = view.model.currentRotationAngle;
        
        const targetContainer = this.hasDragTarget
            ? this.target.targetContainer
            : this.target.initialContainer;
        if (
            !this.target.isDragging
            && view.tile.parent !== targetContainer
        ) {
            this.target.addTileToContainer(targetContainer);
        }

        if (view.model.getIsLocatedCorrectly()) {
            this.target.fixAsLocatedCorrectly();
        }

        if (!this.target.isDragging && !this.target.isMoving) {
            draggingTileData.animatingViews.delete(this.target);
            WheelController.getInstance().setScrollOnWheelActivity(true);
        }        
    }
}