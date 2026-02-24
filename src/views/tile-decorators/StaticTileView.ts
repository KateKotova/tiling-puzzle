import { Texture, Container, Filter, FederatedPointerEvent } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "../tiles/TileView.ts";
import { GlowFilter } from "pixi-filters";
import { DraggingTileData } from "./DraggingTileData.ts";
import { StaticTileParameters } from "./StaticTileParameters.ts";

/**
 * Класс декоратора представления неподвижного элемента замощения,
 * который обозначает место, куда должен быть размещён пользователем подвижный элемент замощения
 */
export class StaticTileView implements TileView {
    private readonly parameters: StaticTileParameters;
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
    private draggingData: DraggingTileData;

    /**
     * Создание неподвижного элемента замощения,
     * служащего ячейкой для перетаскивания подвижного элемента замощения
     * @param parameters Параметры неподвижного элемента замощения
     * @param view Элемент замощения, который декорируется
     * @param draggingData Информация о фигуре, которая перетаскивается в данный момент.
     * Этот объект один на всех.
     */
    constructor (
        parameters: StaticTileParameters,
        view: TileView,
        draggingData: DraggingTileData
    ) {
        this.parameters = parameters;
        this.view = view;
        this.draggingData = draggingData;

        this.view.tile.eventMode = "static";
        this.view.tile.on('pointerenter', this.onPointerEnter, this);
        this.view.tile.on('pointerleave', this.onPointerLeave, this);
        this.view.tile.on('pointerup', this.onPointerUp, this);
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
        const draggingGeometryType = this.draggingData.view?.model.geometry.geometryType;
        const currentGeometryType = this.view.model.geometry.geometryType;
        return draggingGeometryType === currentGeometryType;
    }

    public onPointerEnter(): void {
        if (!this.getDraggingTileHasTheSameType()) {
            return;
        }

        if (this.draggingData.view) {
            if (this.draggingData.view.dragTarget) {
                this.draggingData.view.dragTarget.view.removeFilters();
                this.draggingData.view.dragTarget.isDragTarget = false;
            }
            
            this.draggingData.view.dragTarget = this;
        }
        
        this.isDragTarget = true;
        
        const filter = new GlowFilter(this.parameters.targetGlowFilterOptions);      
        this.view.setFilter(filter);

        this.draggingData.view?.rotateToDragTarget(this.view.model);     
    }

    public onPointerLeave(): void {
        if (!this.isDragTarget || this.draggingData.view?.dragTarget !== this) {
            return;
        }

        this.isDragTarget = false;
        this.view.removeFilters();
        if (this.draggingData.view) {
            this.draggingData.view.dragTarget = undefined;
        }
    }

    public onPointerUp(event: FederatedPointerEvent): void {
        const isTouchEventAndIsMultiTouch = event.pointerType === 'touch'
            && (event as unknown as TouchEvent)?.touches?.length > 1;
        if (isTouchEventAndIsMultiTouch) {
            return;
        }

        if (this.draggingData.view) {
            this.stopBeingDragTarget();            
            this.draggingData.view.onGlobalPointerUp(event);
        }
    }

    public stopBeingDragTarget(): void {
        if (this.isDragTarget) {
            this.isDragTarget = false;
            this.view.removeFilters();
        }
    }

    public removeInteractivity(): void {
        this.view.tile.eventMode = "none";
        this.removeEventListeners();
    }

    private removeEventListeners() {
        this.view.tile.off('pointerenter', this.onPointerEnter, this);
        this.view.tile.off('pointerleave', this.onPointerLeave, this);
        this.view.tile.off('pointerup', this.onPointerUp, this); 
    }

    public destroy(): void {
        this.removeEventListeners();       
        this.view.destroy();
    }
}