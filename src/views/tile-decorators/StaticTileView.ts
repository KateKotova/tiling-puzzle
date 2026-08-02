import {
    Texture,
    Container,
    Filter,
    FederatedPointerEvent,
    Color,
    Polygon,
    Matrix,
    Point
} from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "../tiles/TileView.ts";
import { draggingTileData } from "./DraggingTileData.ts";
import { StaticTileParameters } from "./StaticTileParameters.ts";
import { Algorithm } from "../../math/Algorithm.ts";

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
     * Зона статической фигуры-ячейки, определяемая указателем,
     * когда он проходит над этой ячейкой.
     * Эту зону нужно вычислять и хранить,
     * потому что под перетаскиваемой фигурой во время перетаскивания
     * факт нахождения над статической ячейкой может быть иногда определён не верно,
     * поэтому берутся координаты указателя и определяется, попадает ли указатель в данную зону.
     */
    public worldHitArea?: Polygon;
    /**
     * Признак того, что данная статическая фигура является ячейкой-целью
     * для перетаскивания подвижной фигуры
     */
    private isDragTarget: boolean = false;

    private targetGlowFilter?: GlowFilter;

    private pointerIsOver: boolean = false;
    private pointerEnterTimer?: ReturnType<typeof setTimeout>;
    private pointerLeaveTimer?: ReturnType<typeof setTimeout>;
    private static readonly pointerEnterDelay: number = 50;
    private static readonly pointerLeaveDelay: number = 50;

    /**
     * Создание неподвижного элемента замощения,
     * служащего ячейкой для перетаскивания подвижного элемента замощения
     * @param parameters Параметры неподвижного элемента замощения
     * @param view Элемент замощения, который декорируется
     */
    constructor (parameters: StaticTileParameters, view: TileView) {
        this.parameters = parameters;
        this.view = view;
        this.setWorldHitArea();

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

    public addFilter(filter: Filter): void {
        this.view.addFilter(filter);
    }

    public removeFilter(filter: Filter): void {
        this.view.removeFilter(filter);
    }

    public clearFilters(): void {
        this.view.clearFilters();
    }

    public addHintGlowFilter(): void {
        this.view.addHintGlowFilter();
    }

    public removeHintGlowFilter(): void {
        this.view.removeHintGlowFilter();
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

    private setWorldHitArea(): void {
        const pivotPoint = this.view.model.geometry.pivotPoint;
        const currentPositionPoint = this.view.model.currentPositionPoint;
        
        const tileMatrix = new Matrix()
            .translate(-pivotPoint.x, -pivotPoint.y)
            .rotate(this.view.model.currentRotationAngle)
            .translate(currentPositionPoint.x, currentPositionPoint.y);
        
        this.worldHitArea = Algorithm.getTransformedPolygon(
            this.view.model.geometry.hitArea,
            tileMatrix
        );
    }

    public onPointerEnter(): void {
        if (!this.getDraggingTileHasTheSameType()) {
            return;
        }

        if (this.pointerLeaveTimer !== undefined) {
            clearTimeout(this.pointerLeaveTimer);
            this.pointerLeaveTimer = undefined;
        }

        // Задерживаем вход, чтобы избежать мерцания при быстром движении
        this.pointerEnterTimer = setTimeout(() => {
                this.pointerEnterTimer = undefined;

                if (draggingTileData.view) {
                    if (draggingTileData.view.dragTarget) {
                        draggingTileData.view.dragTarget.removeTargetGlowFilter();
                        draggingTileData.view.dragTarget.isDragTarget = false;
                    }
                    
                    draggingTileData.view.dragTarget = this;
                }
                
                this.isDragTarget = true;
                this.pointerIsOver = true;
                
                const filter = this.getTargetGlowFilter();      
                this.view.addFilter(filter);

                draggingTileData.view?.rotateToDragTarget(this.view.model);
            },
            StaticTileView.pointerEnterDelay
        );
    }

    public onPointerLeave(event: FederatedPointerEvent): void {
        if (this.pointerEnterTimer !== undefined) {
            clearTimeout(this.pointerEnterTimer);
            this.pointerEnterTimer = undefined;
        }

        this.pointerIsOver = false;

        // Задерживаем выход, чтобы избежать мерцания
        this.pointerLeaveTimer = setTimeout(() => {
                this.pointerLeaveTimer = undefined;

                if (this.pointerIsOver
                    || !this.isDragTarget
                    || draggingTileData.view?.dragTarget !== this
                ) {
                    return;
                }

                if (this.getPointerIsInsideWorldHitArea(event)) {
                    this.pointerIsOver = true;
                    return;
                }

                this.isDragTarget = false;
                this.removeTargetGlowFilter();
                if (draggingTileData.view) {
                    draggingTileData.view.dragTarget = draggingTileData.view.dragSource;
                }
            },
            StaticTileView.pointerLeaveDelay
        );
    }

    public onPointerUp(event: FederatedPointerEvent): void {
        const isTouchEventAndIsMultiTouch = event.pointerType === 'touch'
            && (event as unknown as TouchEvent)?.touches?.length > 1;
        if (isTouchEventAndIsMultiTouch) {
            return;
        }

        if (draggingTileData.view) {
            this.stopBeingDragTarget();
            if (event.nativeEvent instanceof PointerEvent) {         
                draggingTileData.view.onGlobalPointerUp(event.nativeEvent);
            }
        }
    }

    private getPointerIsInsideWorldHitArea(event: FederatedPointerEvent): boolean {
        if (!this.worldHitArea) {
            return false;
        }

        const parent = this.view.tile.parent ?? this.view.tile;
        const globalPosition = new Point(event.global.x, event.global.y);
        const parentPosition = parent.toLocal(globalPosition);

        return Algorithm.getPointIsInsidePolygon(parentPosition, this.worldHitArea);
    }

    private getTargetGlowFilter(): GlowFilter {
        if (!this.targetGlowFilter) {
            this.targetGlowFilter = new GlowFilter(this.parameters.targetGlowFilterOptions);
        }
        return this.targetGlowFilter;
    }

    public removeTargetGlowFilter(): void {
        const filter = this.getTargetGlowFilter();
        this.view.removeFilter(filter);
    }

    public stopBeingDragTarget(): void {
        if (this.isDragTarget) {
            this.isDragTarget = false;
            this.removeTargetGlowFilter();
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
        if (this.pointerLeaveTimer !== undefined) {
            clearTimeout(this.pointerLeaveTimer);
            this.pointerLeaveTimer = undefined;
        }

        if (this.pointerEnterTimer !== undefined) {
            clearTimeout(this.pointerEnterTimer);
            this.pointerEnterTimer = undefined;
        }

        this.removeEventListeners();
        
        this.view.clearFilters();
        if (this.targetGlowFilter) {
            this.targetGlowFilter.destroy();
            this.targetGlowFilter = undefined;
        }
        
        if (draggingTileData.view) {
            const draggingTileView = draggingTileData.view;
            if (draggingTileView.dragSource === this) {
                draggingTileView.dragSource = undefined;
            }
            if (draggingTileView.dragTarget === this) {
                draggingTileView.dragTarget = undefined;
            }
        }
        
        this.view.destroy();
    }
}