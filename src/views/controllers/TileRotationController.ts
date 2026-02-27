import { Ticker } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { EntityController } from "./EntityController.ts";
import { TileRotationController as TileRotationModelController}
    from "../../models/controllers/TileRotationController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * угол поворота вокруг опорной точки которого меняется со временем
 */
export class TileRotationController extends EntityController<DraggableTileView, number> {
    private readonly controller: TileRotationModelController;

    constructor(target: DraggableTileView, ticker: Ticker) {
        super(target, ticker);
        this.controller = this.target.view.model.rotationController;
    }

    public restart(dragTargetModel?: TileModel): void {
        this.stop();
        const rotationAngle = dragTargetModel
            ? dragTargetModel.targetRotationAngle
            : Math.random() * 2 * Math.PI;
        const rotationAngleDifference = this.target.view.model
            .getNewPositionMinAngleDifference(rotationAngle);
        this.start(rotationAngleDifference);
    }

    public stop(): void {
        if (!this.controller.getIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
        }
    }

    public start(rotationAngleDifference: number): void {
        this.target.setOnPointerDownActivity(false);
        this.prepareToExecute(rotationAngleDifference);        
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

    protected prepareToExecute(rotationAngleDifference: number): void {
        draggingTileData.animatingViews.add(this.target);
        this.controller.prepareToExecute(rotationAngleDifference);
        this.target.addTileToSelectedContainer();
        
        if (!this.target.isDragging) {
            const filter = new GlowFilter(this.target.parameters.selectedGlowFilterOptions);
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
        
        if (
            !this.target.isDragging
            && view.tile.parent !== this.target.targetContainer
        ) {
            this.target.addTileToTargetContainer();
        }

        if (view.model.getIsLocatedCorrectly()) {
            this.target.fixAsLocatedCorrectly();
        }

        if (!this.target.isDragging && !this.target.isMoving) {
            draggingTileData.animatingViews.delete(this.target);
            window.removeEventListener('wheel', this.target.boundPreventScrollOnWheel);
        }
    }
}