import { Texture, Container, Filter, FederatedPointerEvent } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { TileView } from "../tiles/TileView.ts";
import { GlowFilter } from "pixi-filters";
import { DraggingTileData } from "./DraggingTileData.ts";

/**
 * Класс декоратора представления неподвижного элемента замощения,
 * который обозначает место, куда должен быть размещён пользователем подвижный элемент замощения
 */
export class StaticTileView implements TileView {
    private viewSettings: ViewSettings;
    /**
     * Композиция: элемент замощения, который декорируется
     */
    public view: TileView;
    /**
     * Признак того, что данная статическая фигура является ячейкой-целью
     * для перетаскивания подвижной фигуры
     */
    private isDragTarget: boolean = false;
    /**
     * Информация о фигуре, которая перетаскивается в данный момент.
     * Этот объект один на всех.
     */
    private draggingTileData: DraggingTileData;

    /**
     * Создание неподвижного элемента замощения,
     * служащего ячейкой для перетаскивания подвижного элемента замощения
     * @param viewSettings Настройки представления
     * @param view Элемент замощения, который декорируется
     * @param draggingTileData Информация о фигуре, которая перетаскивается в данный момент.
     * Этот объект один на всех.
     */
    constructor (
        viewSettings: ViewSettings,
        view: TileView,
        draggingTileData: DraggingTileData
    ) {
        this.viewSettings = viewSettings;
        this.view = view;
        this.draggingTileData = draggingTileData;

        this.view.tile.eventMode = "static";
        this.view.tile.on('pointerenter', this.onPointerEnter, this);
    }

    public get model(): TileModel {
        return this.view.model;
    }

    public get texture(): Texture | undefined {
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

    public createContent(shouldAddBevelFilter: boolean): Container {
        return this.view.createContent(shouldAddBevelFilter);
    }

    public replaceContent(newContent: Container): void {
        this.view.replaceContent(newContent);
    }

    private getDraggingTileHasTheSameType(): boolean {
        return !!this.draggingTileData.view
            && this.draggingTileData.view.model.geometry.geometryType
            == this.view.model.geometry.geometryType;
    }

    public onPointerEnter(): void {
        if (this.isDragTarget || !this.getDraggingTileHasTheSameType()) {
            return;
        }

        this.isDragTarget = true;
        if (this.draggingTileData.view) {
            this.draggingTileData.view.dragTarget?.onPointerLeave();
            this.draggingTileData.view.dragTarget = this;
        }
        const filter = new GlowFilter(this.viewSettings.targetStaticTileGlowFilterOptions);      
        this.view.setFilter(filter);

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
            this.draggingTileData.view.dragTarget = undefined;
        }
        this.view.removeFilters();

        this.view.tile.on('pointerenter', this.onPointerEnter, this);
        this.view.tile.off('pointerleave', this.onPointerLeave, this);
        this.view.tile.off('pointerup', this.onPointerUp, this);
    }

    public onPointerUp(event: FederatedPointerEvent): void {
        if (!this.isDragTarget) {
            return;
        }

        this.isDragTarget = false;
        this.view.removeFilters();

        if (this.draggingTileData.view) {
            this.draggingTileData.view.onGlobalPointerUp(event);
        }

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