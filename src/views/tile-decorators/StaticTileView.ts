import { Texture, Container, Filter, FederatedPointerEvent, Color } from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "../tiles/TileView.ts";
import { draggingTileData } from "./DraggingTileData.ts";
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

    private targetGlowFilter?: GlowFilter;

    /**
     * Создание неподвижного элемента замощения,
     * служащего ячейкой для перетаскивания подвижного элемента замощения
     * @param parameters Параметры неподвижного элемента замощения
     * @param view Элемент замощения, который декорируется
     */
    constructor (parameters: StaticTileParameters, view: TileView) {
        this.parameters = parameters;
        this.view = view;

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

    public get replacingTextureFillColor(): Color {
        return this.view.replacingTextureFillColor;
    }

    public set replacingTextureFillColor(color: Color) {
        this.view.replacingTextureFillColor = color;
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
        const draggingGeometryType = draggingTileData.view?.model.geometry.geometryType;
        const currentGeometryType = this.view.model.geometry.geometryType;
        return draggingGeometryType === currentGeometryType;
    }

    public onPointerEnter(): void {
        if (!this.getDraggingTileHasTheSameType()) {
            return;
        }

        if (draggingTileData.view) {
            if (draggingTileData.view.dragTarget) {
                draggingTileData.view.dragTarget.view.removeFilters();
                draggingTileData.view.dragTarget.isDragTarget = false;
            }
            
            draggingTileData.view.dragTarget = this;
        }
        
        this.isDragTarget = true;
        
        const filter = this.getTargetGlowFilter();      
        this.view.setFilter(filter);

        draggingTileData.view?.rotateToDragTarget(this.view.model);     
    }

    public onPointerLeave(): void {
        if (!this.isDragTarget || draggingTileData.view?.dragTarget !== this) {
            return;
        }

        this.isDragTarget = false;
        this.view.removeFilters();
        if (draggingTileData.view) {
            draggingTileData.view.dragTarget = draggingTileData.view.dragSource;
        }
    }

    public onPointerUp(event: FederatedPointerEvent): void {
        const isTouchEventAndIsMultiTouch = event.pointerType === 'touch'
            && (event as unknown as TouchEvent)?.touches?.length > 1;
        if (isTouchEventAndIsMultiTouch) {
            return;
        }

        if (draggingTileData.view) {
            this.stopBeingDragTarget();            
            draggingTileData.view.onGlobalPointerUp(event);
        }
    }

    private getTargetGlowFilter(): GlowFilter {
        if (!this.targetGlowFilter) {
            this.targetGlowFilter = new GlowFilter(this.parameters.targetGlowFilterOptions);
        }
        return this.targetGlowFilter;
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
        this.view.removeFilters();    
        if (this.targetGlowFilter) {
            this.targetGlowFilter.destroy();
        }    
        this.view.destroy();
    }
}