import {
    Texture,
    Container,
    Point,
    Ticker,
    FederatedPointerEvent,
    Filter,
    Polygon,
    Matrix,
    IHitArea
} from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { StaticTileView } from "./StaticTileView.ts";
import { DraggingTileData } from "./DraggingTileData.ts";
import { TileView } from "../tiles/TileView.ts";
import { GlowFilter } from "pixi-filters";
import { AdditionalMath } from "../../math/AdditionalMath.ts";

/**
 * Класс декоратора представления подвижного элемента замощения
 */
export class DraggableTileView implements TileView {
    private readonly viewSettings: ViewSettings;
    /**
     * Композиция: элемент замощения, который декорируется
     */
    public view: TileView;
    /**
     * Сохраняемая область попадания.
     * При движении область попадания и события указателя отключаются,
     * чтобы события указателя были видны элементам мозаики ниже.
     * После окончания движения зона попадания восстанавливается.
     */
    private hitArea?: IHitArea;
    /**
     * Контейнер, в котором фигура находится по умолчанию
     */
    private parentContainer: Container | null = null;
    /**
     * Контейнер, в который фигура переносится на время вращения и/или перетаскивания
     */
    private selectedTileContainer: Container;
    private ticker: Ticker;

    private isDragging: boolean = false;
    private dragOffset: Point = new Point(0, 0);
    private dragStartPosition: Point = new Point(0, 0);
    private dragStartTime: number = 0;
    /**
     * Информация о фигуре, которая перетаскивается в данный момент.
     * Этот объект один на всех.
     */
    private draggingTileData: DraggingTileData;
    /**
     * Статическая фигура-ячейка, с которой происходит перетаскивание
     */
    private dragSource?: StaticTileView;
    /**
     * Зона целевой статической фигуры-ячейки, определяемая указателем.
     * Исходная ячейка почему-то не определяется как целевая и не реагирует на события мыши.
     * Эту зону нужно вычислять и хранить для перетаскивания,
     * потому что под перетаскиваемой фигурой зона не видна.
     */
    private dragSourceAbsoluteHitArea?: Polygon;
    private initialDragSource?: StaticTileView;
    private initialDragSourceAbsoluteHitArea?: Polygon;
    /**
     * Статическая фигура-ячейка, на которую происходит перетаскивание
     */
    public dragTarget?: StaticTileView;

    private onPointerDownIsActive: boolean = true;
    /**
     * Признака того, что фигура находится в правильной позиции
     * и с правильным углом вращения, чтобы мозаика была собрана
     */
    private isLocatedCorrectly: boolean = false;

    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);
    private boundOnMoveTicker: (ticker: Ticker) => void = this.onMoveTicker.bind(this);
    private boundGlobalPointerUp: (event: PointerEvent) => void
        = this.onGlobalPointerUp.bind(this);

    /**
     * Создание подвижного элемента замощения
     * @param viewSettings Настройки представления
     * @param view Элемент замощения, который декорируется
     * @param selectedTileContainer Контейнер, в который фигура переносится
     * на время вращения и/или перетаскивания
     * @param ticker Инструмент PixiJS, отвечающий за время
     * @param draggingTileData Информация о фигуре, которая перетаскивается в данный момент.
     * Этот объект один на всех.
     */
    constructor (
        viewSettings: ViewSettings,
        view: TileView,
        selectedTileContainer: Container,
        ticker: Ticker,
        draggingTileData: DraggingTileData
    ) {            
        this.viewSettings = viewSettings;
        this.view = view;
        this.parentContainer = this.view.tile.parent;
        this.selectedTileContainer = selectedTileContainer;
        this.ticker = ticker;
        this.draggingTileData = draggingTileData;

        this.view.tile.eventMode = "static";
        this.view.tile.on('pointerdown', this.onPointerDown, this);

        this.hitArea = (this.view.tile.hitArea as unknown as Polygon).clone();
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

    public setOnPointerDownActivity(isActive: boolean) {
        if ((isActive && this.onPointerDownIsActive)
            || (!isActive && !this.onPointerDownIsActive)) {
            return;
        }
        this.onPointerDownIsActive = isActive;
        if (isActive) {
            this.view.tile.on('pointerdown', this.onPointerDown, this);
        } else {
            this.view.tile.off('pointerdown', this.onPointerDown, this);
        }
    }

    private onPointerTap(event: PointerEvent): void {
        const pointerIsMouseAndButtonIsNotLeft = event.pointerType === 'mouse' && event.button !== 0;
        if (pointerIsMouseAndButtonIsNotLeft) {
            return;
        }
        this.stopRotation();
        const rotationAngleDifference = this.view.model
            .getSamePositionNextAngleMinAngleDifference();
        this.startRotation(rotationAngleDifference);
    }

    private onRotationTicker(ticker: Ticker) {
        this.executeRotation(ticker.deltaMS);
        if (this.view.model.getRotationIsCompleted()) {
            this.completeRotation();
            this.ticker.remove(this.boundOnRotationTicker);
            this.setOnPointerDownActivity(true);
        }        
    }

    private onMoveTicker(ticker: Ticker) {
        this.executeMove(ticker.deltaMS);
        if (this.view.model.getMoveIsCompleted()) {
            this.completeMove();
            this.ticker.remove(this.boundOnMoveTicker);
            this.setOnPointerDownActivity(true);
        }        
    }

    public rotateToDragTarget(dragTargetModel: TileModel): void {
        this.stopRotation();
        const rotationAngleDifference = this.view.model.getNewPositionMinAngleDifference(
            dragTargetModel.targetRotationAngle);
        this.startRotation(rotationAngleDifference);
    }

    public moveToStaticTile(staticTileModel: TileModel): void {
        this.stopMove();
        const moveDifference = new Point(
            staticTileModel.targetPositionPoint.x - this.view.model.currentPositionPoint.x,
            staticTileModel.targetPositionPoint.y - this.view.model.currentPositionPoint.y);
        this.startMove(moveDifference);
    }
    
    private stopRotation(): void {
        if (!this.view.model.getRotationIsCompleted()) {
            this.ticker.remove(this.boundOnRotationTicker);
        }
    }

    private stopMove(): void {
        if (!this.view.model.getMoveIsCompleted()) {
            this.ticker.remove(this.boundOnMoveTicker);
        }
    }

    private startRotation(rotationAngleDifference: number): void {
        this.setOnPointerDownActivity(false);
        this.prepareToRotation(rotationAngleDifference);        
        this.ticker.add(this.boundOnRotationTicker);
    }

    private startMove(moveDifference: Point): void {
        this.setOnPointerDownActivity(false);
        this.prepareToMove(moveDifference);        
        this.ticker.add(this.boundOnMoveTicker);
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        this.view.model.prepareToRotation(rotationAngleDifference);
        this.selectedTileContainer.addChild(this.view.tile);
        
        if (!this.isDragging) {
            const filter = new GlowFilter(this.viewSettings.selectedTileGlowFilterOptions);
            this.view.setFilter(filter);
        }
    }

    private prepareToMove(moveDifference: Point): void {
        this.view.model.prepareToMove(moveDifference);
        const filter = new GlowFilter(this.viewSettings.selectedTileGlowFilterOptions);
        this.view.setFilter(filter);
    }

    private executeRotation(deltaTime: number): void {
        this.view.model.executeRotation(deltaTime);
        this.view.tile.rotation = this.view.model.currentRotationAngle;
    }

    private executeMove(deltaTime: number): void {
        this.view.model.executeMove(deltaTime);
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);
    }

    private completeRotation(): void {
        if (!this.isDragging) {
            this.view.removeFilters();
            this.addTileToParentContainer();
        }
        
        this.view.model.completeRotation();
        this.view.tile.rotation = this.view.model.currentRotationAngle;

        if (this.view.model.getIsLocatedCorrectly()) {
            this.fixAsLocatedCorrectly();
        }
    }

    private completeMove(): void {
        this.view.removeFilters();
        this.addTileToParentContainer();
        this.view.model.completeMove();
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);

        if (this.view.model.getIsLocatedCorrectly()) {
            this.fixAsLocatedCorrectly();
        }
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        if (event.propagationStopped) {
            return;
        }

        const isMouseEventAndNotLeftButton = event.pointerType === 'mouse' && event.button !== 0;
        if (isMouseEventAndNotLeftButton) {
            return;
        }
        
        const isTouchEventAndIsMultiTouch = event.pointerType === 'touch'
            && (event as unknown as TouchEvent)?.touches?.length > 1;
        if (isTouchEventAndIsMultiTouch) {
            return;
        }

        this.isDragging = true;
        this.draggingTileData.view = this;

        this.setOnPointerDownActivity(false);
        this.view.tile.on('globalpointermove', this.onPointerMove, this);
        window.addEventListener('pointerup', this.boundGlobalPointerUp);

        this.dragStartPosition = this.view.tile.position.clone();
        this.dragStartTime = event.timeStamp;
        
        const globalPosition = new Point(event.global.x, event.global.y);
        const tileWorldPosition = this.getTileWorldPosition(globalPosition);
        
        this.dragOffset.set(
            tileWorldPosition.x - this.view.model.currentPositionPoint.x,
            tileWorldPosition.y - this.view.model.currentPositionPoint.y
        );
        
        this.selectedTileContainer.addChild(this.view.tile);
        const filter = new GlowFilter(this.viewSettings.selectedTileGlowFilterOptions);
        this.view.setFilter(filter);

        // Убираем зону попадания, чтобы события указателя были видны
        // статическим элементам замощения уровнем ниже
        this.view.tile.hitArea = undefined;
        this.view.content.hitArea = undefined;
    }

    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.isDragging) {
            return;
        }
        
        if (this.draggingTileData.view !== this) {
            return;
        }
        
        const globalPosition = new Point(event.global.x, event.global.y);        
        const tileWorldPosition = this.getTileWorldPosition(globalPosition);
        
        this.view.model.currentPositionPoint.set(
            tileWorldPosition.x - this.dragOffset.x,
            tileWorldPosition.y - this.dragOffset.y
        );
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);

        if (this.initialDragSource && this.initialDragSourceAbsoluteHitArea) {
            this.checkDragSourceActivity(
                this.initialDragSource,
                this.initialDragSourceAbsoluteHitArea,
                tileWorldPosition
            );
        } else if (this.dragSource && this.dragSourceAbsoluteHitArea) {
            this.checkDragSourceActivity(
                this.dragSource,
                this.dragSourceAbsoluteHitArea,
                tileWorldPosition
            );
        }
    }

    /**
     * Исходная ячейка почему-то не определяется как целевая при перемещении
     * и не реагирует на события указателя.
     * Поэтому здесь мы смотрим, не попадает ли указатель в зону исходной ячейки,
     * чтобы её подсветить или, наоборот, чтобы убрать подсветку.
     * @param dragSource Исходная ячейка для перетаскивания
     * @param dragSourceAbsoluteHitArea Зона захвата ячейки для перетаскивания
     * в координатах родителя
     * @param tileWorldPosition Координаты точки в мире координат,
     * где живёт модель элемента замощения)
     */
    private checkDragSourceActivity(
        dragSource: StaticTileView,
        dragSourceAbsoluteHitArea: Polygon,
        tileWorldPosition: Point
    ): void {
        const pointerIsInHitArea = AdditionalMath.getPointIsInsidePolygon(
            tileWorldPosition,
            dragSourceAbsoluteHitArea
        );
        
        if (!this.dragTarget && pointerIsInHitArea) {
            dragSource.onPointerEnter();
        } else if (this.dragTarget && !pointerIsInHitArea) {
            dragSource.onPointerLeave();
        }
    }

    public onGlobalPointerUp(event: PointerEvent): void {
        const isTouchEventAndIsMultiTouch = event.pointerType === 'touch'
            && (event as unknown as TouchEvent)?.touches?.length > 1;

        if (
            isTouchEventAndIsMultiTouch
            || !this.isDragging
            || this.draggingTileData.view !== this
        ) {
            return;
        }

        this.isDragging = false;

        const finalTarget = this.dragTarget;
        const finalSource = this.dragSource;
        
        if (finalTarget) {
            finalTarget.stopBeingDragTarget();
        } else if (finalSource) {
            finalSource.stopBeingDragTarget();
        }

        // Восстанавливаем зону попадания, чтобы снова получать события указателя
        this.view.tile.hitArea = this.hitArea;
        this.view.content.hitArea = this.hitArea;

        const tapWasExecuted
            = (event.timeStamp - this.dragStartTime <= this.viewSettings.tapMaxDuration)
            && Math.abs(this.view.tile.position.x - this.dragStartPosition.x)
                <= this.viewSettings.tapMaxDistance
            && Math.abs(this.view.tile.position.y - this.dragStartPosition.y)
                <= this.viewSettings.tapMaxDistance;

        const moveTargetModel = finalTarget?.model ?? finalSource?.model;
        
        if (moveTargetModel) {
            this.moveToStaticTile(moveTargetModel);
            if (!tapWasExecuted) {
                this.rotateToDragTarget(moveTargetModel);
            }
        } else {
            this.setOnPointerDownActivity(true);
            this.addTileToParentContainer();
            this.view.removeFilters();
        }

        if (finalTarget) {
            this.setDragSource(finalTarget);
        }
        
        this.dragTarget = undefined;
        this.draggingTileData.view = null;

        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);
        
        if (tapWasExecuted) {
            this.view.model.currentPositionPoint.set(this.dragStartPosition.x,
                this.dragStartPosition.y);
            this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);
            this.onPointerTap(event);
        } else {
            this.setOnPointerDownActivity(true);
        }
    }

    private addTileToParentContainer() {
        if (this.parentContainer) {
            if (this.parentContainer != this.view.tile.parent) {
                this.parentContainer?.addChild(this.view.tile);            
            }
        } else if (this.selectedTileContainer == this.view.tile.parent) {
            this.selectedTileContainer.removeChild(this.view.tile);
        }
    }

    public setInitialDragSource(initialDragSource?: StaticTileView) {
        this.setDragSource(initialDragSource);
        this.initialDragSource = this.dragSource;
        this.initialDragSourceAbsoluteHitArea = this.dragSourceAbsoluteHitArea?.clone();
    }

    public setDragSource(dragSource?: StaticTileView) {
        this.dragSource = dragSource;
        if (!dragSource) {
            this.dragSourceAbsoluteHitArea = undefined;
            return;
        }

        const pivotPoint = dragSource.view.model.geometry.pivotPoint;
        const currentPositionPoint = dragSource.view.model.currentPositionPoint;
        
        const tileMatrix = new Matrix()
            .translate(-pivotPoint.x, -pivotPoint.y)
            .rotate(dragSource.view.model.currentRotationAngle)
            .translate(currentPositionPoint.x, currentPositionPoint.y);
        
        const tileWorldHitArea = AdditionalMath.getTransformedPolygon(
            dragSource.view.model.geometry.hitArea,
            tileMatrix
        );
        
        this.dragSourceAbsoluteHitArea = tileWorldHitArea;
    }

    /**
     * Получение глобальных координат экрана в мировых координатах контента
     * (координаты, в которых живёт модель элемента замощения)
     * @param globalPoint Глобальные координаты
     * @returns Координаты, в которых живёт модель элемента замощения
     */
    private getTileWorldPosition(globalPoint: Point): Point {
        return this.parentContainer
            ? this.parentContainer.toLocal(globalPoint)
            : globalPoint;
    }

    private removeEventListeners() {
        this.ticker.remove(this.boundOnRotationTicker);
        this.ticker.remove(this.boundOnMoveTicker);
        this.view.tile.off('pointerdown', this.onPointerDown, this);
        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);
    }

    /**
     * Фиксация элемента мозаики на своём месте после того, как он принял правильное положение.
     * Элемент мозаики подсвечивается, потом погасает.
     * Выдавленная рамка убирается, и фигура становится часть картинки.
     * Реакция на события указателя пропадает.
     */
    private fixAsLocatedCorrectly(): void {
        if (this.isLocatedCorrectly) {
            return;
        }
        this.isLocatedCorrectly = true;

        this.view.tile.eventMode = "none";
        this.removeEventListeners();

        this.selectedTileContainer.addChild(this.view.tile);
        const filter = new GlowFilter(this.viewSettings.correctLocatedTileGlowFilterOptions);
        this.view.setFilter(filter);

        setTimeout(() => {
            this.removeFilters();
            this.addTileToParentContainer();
            const contentWithoutBevelFilter = this.view.createContent(false);
            this.view.replaceContent(contentWithoutBevelFilter);
        },  this.viewSettings.correctLocatedTileFilterShowTime);
    }

    public destroy(): void {
        this.removeEventListeners();
        this.view.destroy();
    }
}