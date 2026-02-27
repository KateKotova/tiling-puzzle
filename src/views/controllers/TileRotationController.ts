import { Ticker } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { EntityController } from "./EntityController.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * угол поворота вокруг опорной точки которого меняется со временем
 */
export class TileRotationController extends EntityController<DraggableTileView, number> {
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
        if (!this.target.view.model.getRotationIsCompleted()) {
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
        if (this.target.view.model.getRotationIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            this.target.setOnPointerDownActivity(true);
        }        
    }

    protected prepareToExecute(rotationAngleDifference: number): void {
        draggingTileData.animatingViews.add(this.target);
        this.target.view.model.prepareToRotation(rotationAngleDifference);
        this.target.addTileToSelectedContainer();
        
        if (!this.target.isDragging) {
            const filter = new GlowFilter(this.target.parameters.selectedGlowFilterOptions);
            this.target.view.setFilter(filter);
        }
    }

    protected execute(deltaTime: number): void {
        this.target.view.model.executeRotation(deltaTime);
        this.target.view.tile.rotation = this.target.view.model.currentRotationAngle;
    }

    protected complete(): void {
        const view = this.target.view;
        if (!this.target.isDragging) {
            view.removeFilters();
        }
        
        view.model.completeRotation();
        
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