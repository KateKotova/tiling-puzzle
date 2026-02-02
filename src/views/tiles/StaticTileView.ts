import { Texture, Container, Filter } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "./TileView.ts";
import { DraggingTileData } from "./DraggingTileData.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";

export class StaticTileView implements TileView {
    private viewSettings: ViewSettings;
    public view: TileView;
    private isDragTarget: boolean = false;
    private draggingTileData: DraggingTileData;

    constructor (viewSettings: ViewSettings, view: TileView, draggingTileData: DraggingTileData) {
        this.viewSettings = viewSettings;
        this.view = view;
        this.draggingTileData = draggingTileData;

        this.view.tile.eventMode = "static";
        this.view.tile.on('pointerenter', this.onPointerEnter, this);
    }

    public get model(): TileModel {
        return this.view.model;
    }

    public get texture(): Texture | null {
        return this.view.texture;
    }

    public get tile(): Container {
        return this.view.tile;
    }

    public get content(): Container {
        return this.view.content;
    }

    public setFilter(filter: Filter): void {
        this.view.setFilter(filter);
    }

    public removeFilters(): void {
        this.view.removeFilters();
    }

    private getDraggingTileHasTheSameType(): boolean {
        if (!this.draggingTileData.view?.model
            || this.draggingTileData.view.model.tileType != this.view.model.tileType) {
            return false;
        }

        if (this.draggingTileData.view.model instanceof RegularPolygonTileModel) {
            const draggingModel = this.draggingTileData.view.model as RegularPolygonTileModel;
            if (!(this.view.model instanceof RegularPolygonTileModel)) {
                return false;
            }
            const model = this.view.model as RegularPolygonTileModel;
            if (draggingModel.sideCount != model.sideCount) {
                return false;
            }
        }

        return true;
    }

    public onPointerEnter(): void {
        if (this.isDragTarget || !this.getDraggingTileHasTheSameType()) {
            return;
        }

        this.isDragTarget = true;
        if (this.draggingTileData.view) {
            this.draggingTileData.view.dragTarget = this;
        }        
        this.view.setFilter(this.viewSettings.targetEmptyTileGlowFilter);

        this.view.tile.off('pointerenter', this.onPointerEnter, this);
        this.view.tile.on('pointerleave', this.onPointerLeave, this);
        this.view.tile.on('pointerup', this.onPointerUp, this);

        this.draggingTileData.view?.rotateToDragTarget(this.view.model);
    }

    public onPointerLeave(): void {
        if (!this.isDragTarget) {
            return;
        }

        this.isDragTarget = false;
        if (this.draggingTileData.view && this.draggingTileData.view.dragTarget == this) {
            this.draggingTileData.view.dragTarget = null;
        }
        this.view.removeFilters();

        this.view.tile.on('pointerenter', this.onPointerEnter, this);
        this.view.tile.off('pointerleave', this.onPointerLeave, this);
        this.view.tile.off('pointerup', this.onPointerUp, this);
    }

    public onPointerUp(): void {
        if (!this.isDragTarget) {
            return;
        }

        this.isDragTarget = false;
        this.view.removeFilters();

        this.view.tile.on('pointerenter', this.onPointerEnter, this);
        this.view.tile.off('pointerleave', this.onPointerLeave, this);
        this.view.tile.off('pointerup', this.onPointerUp, this);
    }

    public destroy(): void {
        this.view.tile.off('pointerenter', this.onPointerEnter, this);
        this.view.tile.off('pointerleave', this.onPointerLeave, this);
        this.view.tile.off('pointerup', this.onPointerUp, this);        
        this.view.destroy();
    }
}