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
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { StaticTileView } from "./StaticTileView.ts";
import { draggingTileData } from "./DraggingTileData.ts";
import { TileView } from "../tiles/TileView.ts";
import { Algorithm } from "../../math/Algorithm.ts";
import { DraggableTileParameters } from "./DraggableTileParameters.ts";
import { TileLineContainer } from "../components/TileLineContainer.ts";

/**
 * Класс декоратора представления подвижного элемента замощения
 */
export class DraggableTileView implements TileView {
    private readonly parameters: DraggableTileParameters;
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
     * Контейнер, в котором фигура должна находиться, чтобы картинка была собрана
     */
    private targetContainer: Container;
    /**
     * Контейнер, в который фигура переносится на время вращения и/или перетаскивания
     */
    private selectedContainer: Container;
    private ticker: Ticker;

    private isMoving: boolean = false;

    private isDragging: boolean = false;
    private dragOffset: Point = new Point(0, 0);
    private dragStartPosition: Point = new Point(0, 0);
    private dragStartTime: number = 0;
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
    private dragSourceWorldHitArea?: Polygon;
    /**
     * Статическая фигура-ячейка, на которую происходит перетаскивание
     */
    public dragTarget?: StaticTileView;

    /**
     * Контейнер линии, в котором фигура находится изначально
     */
    private initialContainer: TileLineContainer;

    /**
     * Сохранённая глобальная позиция.
     * Нужна для сохранения и восстановления координат после смены контейнеров.
     */
    private savedGlobalPosition: Point = new Point(0, 0);

    private pointerDownId?: number;
    private onPointerDownIsActive: boolean = true;
    /**
     * Признака того, что фигура находится в правильной позиции
     * и с правильным углом вращения, чтобы мозаика была собрана
     */
    private isLocatedCorrectly: boolean = false;

    private boundOnRotationTicker: (ticker: Ticker) => void = this.onRotationTicker.bind(this);
    private boundOnMoveAfterDragTicker: (ticker: Ticker) => void
        = this.onMoveAfterDragTicker.bind(this);
    private boundOnMoveInInitialContainerTicker: (ticker: Ticker) => void
        = this.onMoveInInitialContainerTicker.bind(this);
    private boundGlobalPointerUp: (event: PointerEvent) => void
        = this.onGlobalPointerUp.bind(this);
    private boundPreventScrollOnWheel: (event: WheelEvent) => void
        = this.preventScrollOnWheel.bind(this);

    /**
     * Создание подвижного элемента замощения
     * @param parameters Параметры подвижного элемента замощения
     * @param view Элемент замощения, который декорируется
     * @param initialContainer Контейнер линии, в котором фигура находится изначально
     * @param targetContainer Контейнер, в котором фигура должна находиться,
     * чтобы мозаика была собрана
     * @param selectedContainer Контейнер, в который фигура переносится
     * на время вращения и/или перетаскивания
     * @param ticker Инструмент PixiJS, отвечающий за время
     */
    constructor (
        parameters: DraggableTileParameters,
        view: TileView,
        initialContainer: TileLineContainer,
        targetContainer: Container,
        selectedContainer: Container,
        ticker: Ticker
    ) {            
        this.parameters = parameters;
        this.view = view;
        this.initialContainer = initialContainer;
        this.targetContainer = targetContainer;
        this.selectedContainer = selectedContainer;
        this.ticker = ticker;

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

    public setOnPointerDownActivity(isActive: boolean): void {
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
        if (this.getPointerIsMouseAndButtonIsNotLeft(event)) {
            return;
        }
        this.stopRotation();
        const rotationAngleDifference = this.view.model
            .getSamePositionNextAngleMinAngleDifference();
        this.startRotation(rotationAngleDifference);
    }

    private onRotationTicker(ticker: Ticker): void {
        this.executeRotation(ticker.deltaMS);
        if (this.view.model.getRotationIsCompleted()) {
            this.completeRotation();
            this.ticker.remove(this.boundOnRotationTicker);
            this.setOnPointerDownActivity(true);
        }        
    }

    private onMoveAfterDragTicker(ticker: Ticker): void {
        this.executeMoveAfterDrag(ticker.deltaMS);
        if (this.view.model.getMoveIsCompleted()) {
            this.completeMoveAfterDrag();
            this.ticker.remove(this.boundOnMoveAfterDragTicker);
            this.setOnPointerDownActivity(true);
        }        
    }

    private onMoveInInitialContainerTicker(ticker: Ticker): void {
        this.executeMoveInInitialContainer(ticker.deltaMS);
        if (this.view.model.getMoveIsCompleted()) {
            this.completeMoveInInitialContainer();
            this.ticker.remove(this.boundOnMoveInInitialContainerTicker);
            this.setOnPointerDownActivity(true);
        }        
    }

    public rotateToDragTarget(dragTargetModel?: TileModel): void {
        this.stopRotation();
        const rotationAngle = dragTargetModel
            ? dragTargetModel.targetRotationAngle
            : Math.random() * 2 * Math.PI;
        const rotationAngleDifference = this.view.model.getNewPositionMinAngleDifference(
            rotationAngle);
        this.startRotation(rotationAngleDifference);
    }

    public moveToDragTarget(dragTargetModel?: TileModel): void {
        this.stopMoveAfterDrag();
        
        const targetInTarget = dragTargetModel
            ? dragTargetModel.targetPositionPoint
            : this.initialContainer.getTilePositionPoint(this.view.model.targetTilePosition);
        
        let moveDifference: Point;
        if (this.view.tile.parent === this.selectedContainer) {
            const target = dragTargetModel
                ? this.targetContainer
                : this.initialContainer;
            const targetInGlobal = target.toGlobal(targetInTarget);
            const targetInSelected = this.selectedContainer.toLocal(targetInGlobal);            
            moveDifference = new Point(
                targetInSelected.x - this.view.model.currentPositionPoint.x,
                targetInSelected.y - this.view.model.currentPositionPoint.y
            );
        } else {
            moveDifference = new Point(
                targetInTarget.x - this.view.model.currentPositionPoint.x,
                targetInTarget.y - this.view.model.currentPositionPoint.y
            );
        }

        this.startMoveAfterDrag(moveDifference);
    }

    public moveInInitialContainer(targetPoint: Point): void {
        this.stopMoveInInitialContainer();
        
        const moveDifference = new Point(
            targetPoint.x - this.view.model.currentPositionPoint.x,
            targetPoint.y - this.view.model.currentPositionPoint.y
        );

        this.startMoveInInitialContainer(moveDifference);
    }
    
    private stopRotation(): void {
        if (!this.view.model.getRotationIsCompleted()) {
            this.ticker.remove(this.boundOnRotationTicker);
        }
    }

    private stopMoveAfterDrag(): void {
        if (!this.view.model.getMoveIsCompleted()) {
            this.ticker.remove(this.boundOnMoveAfterDragTicker);
            this.isMoving = false;
        }
    }

    private stopMoveInInitialContainer(): void {
        if (!this.view.model.getMoveIsCompleted()) {
            this.ticker.remove(this.boundOnMoveInInitialContainerTicker);
            this.isMoving = false;
        }
    }

    private startRotation(rotationAngleDifference: number): void {
        this.setOnPointerDownActivity(false);
        this.prepareToRotation(rotationAngleDifference);        
        this.ticker.add(this.boundOnRotationTicker);
    }

    private startMoveAfterDrag(moveDifference: Point): void {
        this.isMoving = true;
        this.setOnPointerDownActivity(false);
        this.prepareToMoveAfterDrag(moveDifference);        
        this.ticker.add(this.boundOnMoveAfterDragTicker);
    }

    private startMoveInInitialContainer(moveDifference: Point): void {
        this.isMoving = true;
        this.setOnPointerDownActivity(false);
        this.prepareToMoveInInitialContainer(moveDifference);        
        this.ticker.add(this.boundOnMoveInInitialContainerTicker);
    }

    private prepareToRotation(rotationAngleDifference: number): void {
        draggingTileData.animatingViews.add(this);
        this.view.model.prepareToRotation(rotationAngleDifference);
        this.addTileToSelectedContainer();
        
        if (!this.isDragging) {
            const filter = new GlowFilter(this.parameters.selectedGlowFilterOptions);
            this.view.setFilter(filter);
        }
    }

    private prepareToMoveAfterDrag(moveDifference: Point): void {
        draggingTileData.animatingViews.add(this);
        this.view.model.prepareToMove(moveDifference);

        if (this.view.tile.parent !== this.selectedContainer) {
            this.addTileToSelectedContainer();
        }

        const filter = new GlowFilter(this.parameters.selectedGlowFilterOptions);
        this.view.setFilter(filter);
    }

    private prepareToMoveInInitialContainer(moveDifference: Point): void {
        this.view.model.prepareToMove(moveDifference);
    }

    private executeRotation(deltaTime: number): void {
        this.view.model.executeRotation(deltaTime);
        this.view.tile.rotation = this.view.model.currentRotationAngle;
    }

    private executeMoveAfterDrag(deltaTime: number): void {
        this.view.model.executeMove(deltaTime);
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);

        const globalPosition = this.view.tile.parent
            ? this.view.tile.parent.toGlobal(this.view.model.currentPositionPoint)
            : this.view.model.currentPositionPoint;
        this.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            globalPosition, this);
    }

    private executeMoveInInitialContainer(deltaTime: number): void {
        this.view.model.executeMove(deltaTime);
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);
    }

    private completeRotation(): void {
        if (!this.isDragging) {
            this.view.removeFilters();
        }
        
        this.view.model.completeRotation();
        
        this.view.tile.rotation = this.view.model.currentRotationAngle;
        
        if (!this.isDragging && this.view.tile.parent !== this.targetContainer) {
            this.addTileToTargetContainer();
        }

        if (this.view.model.getIsLocatedCorrectly()) {
            this.fixAsLocatedCorrectly();
        }

        if (!this.isDragging && !this.isMoving) {
            draggingTileData.animatingViews.delete(this);
            window.removeEventListener('wheel', this.boundPreventScrollOnWheel);
        }
    }

    private completeMoveAfterDrag(): void {
        this.view.removeFilters();
        
        this.view.model.completeMove();
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);
        
        if (this.view.tile.parent !== this.targetContainer) {
            this.addTileToTargetContainer();
        }

        if (this.view.model.getIsLocatedCorrectly()) {
            this.fixAsLocatedCorrectly();
        }

        draggingTileData.animatingViews.delete(this);
        window.removeEventListener('wheel', this.boundPreventScrollOnWheel);

        this.isMoving = false;
    }

    private completeMoveInInitialContainer(): void {
        this.view.model.completeMove();
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);
        this.isMoving = false;
    }

    private addTileToTargetContainer(): void {
        const targetContainer = this.getTargetContainer();

        this.saveGlobalPosition();
        targetContainer.addChild(this.view.tile);
        this.restoreTargetScale();
        this.restoreGlobalPosition();
        
        const newPosition = targetContainer.toLocal(this.savedGlobalPosition);
        this.view.tile.position.copyFrom(newPosition);
        this.view.model.currentPositionPoint.copyFrom(this.view.tile.position);
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        if (event.propagationStopped || this.getPointerIsMouseAndButtonIsNotLeft(event)) {
            return;
        }

        if (event.pointerType === 'touch') {
            if (event.isPrimary) {
                this.pointerDownId = event.pointerId;
            } else {
                return;
            }
        }

        if (event.pointerType === 'mouse') {
            window.addEventListener('wheel', this.boundPreventScrollOnWheel, { passive: false });
        }

        this.isDragging = true;
        draggingTileData.view = this;
        draggingTileData.animatingViews.add(this);

        this.setOnPointerDownActivity(false);
        this.view.tile.on('globalpointermove', this.onPointerMove, this);
        window.addEventListener('pointerup', this.boundGlobalPointerUp);

        this.dragStartPosition = this.view.tile.position.clone();
        this.dragStartTime = event.timeStamp;
        
        const globalPosition = new Point(event.global.x, event.global.y);
        const targetPosition = this.getTargetContainerPosition(globalPosition);

        if (!draggingTileData.viewport) {
            throw new Error('draggingTileData.viewport should be initialized');
        }

        const targetScale = this.dragSource
            ? draggingTileData.viewport.scale.x
            : 1;
        
        this.dragOffset.set(
            (targetPosition.x - this.view.model.currentPositionPoint.x) * targetScale,
            (targetPosition.y - this.view.model.currentPositionPoint.y) * targetScale
        );
        
        this.addTileToSelectedContainer();
        
        const selectedPosition = this.selectedContainer.toLocal(globalPosition);
        this.view.model.currentPositionPoint.set(
            selectedPosition.x - this.dragOffset.x,
            selectedPosition.y - this.dragOffset.y
        );
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);
        
        const filter = new GlowFilter(this.parameters.selectedGlowFilterOptions);
        this.view.setFilter(filter);

        // Убираем зону попадания, чтобы события указателя были видны
        // статическим элементам замощения уровнем ниже
        this.view.tile.hitArea = undefined;
        this.view.content.hitArea = undefined;
    }

    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.isDragging
            || draggingTileData.view !== this
            || (
                event.pointerType === 'touch'
                && event.isPrimary
                && this.pointerDownId !== event.pointerId
            )
        ) {
            return;
        }

        const globalPosition = new Point(event.global.x, event.global.y);
        const selectedPosition = this.selectedContainer.toLocal(globalPosition);
        
        this.view.model.currentPositionPoint.set(
            selectedPosition.x - this.dragOffset.x,
            selectedPosition.y - this.dragOffset.y
        );
        this.view.tile.position.copyFrom(this.view.model.currentPositionPoint);

        const globalCurrentPosition = this.selectedContainer.toGlobal(this.view.tile.position);
        this.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
            globalCurrentPosition, this);

        const targetPosition = this.getTargetContainerPosition(globalPosition);

        if (this.dragSource && this.dragSourceWorldHitArea) {
            this.tryToEnterToDragSource(
                this.dragSource,
                this.dragSourceWorldHitArea,
                targetPosition
            );
        }
    }

    public onGlobalPointerUp(event: PointerEvent): void {
        if (!this.isDragging || draggingTileData.view !== this) {
            return;
        }

        if (event.pointerType === 'touch') {
            if (this.pointerDownId === event.pointerId) {
                this.pointerDownId = undefined;
            } else {
                return;
            }
        }

        this.isDragging = false;   

        const finalTarget = this.dragTarget;
        const finalSource = this.dragSource;
        const finalTargetContainer = this.getTargetContainer();
        
        if (finalTarget) {
            finalTarget.stopBeingDragTarget();
        } else if (finalSource) {
            finalSource.stopBeingDragTarget();
        }

        // Восстанавливаем зону попадания, чтобы снова получать события указателя
        this.view.tile.hitArea = this.hitArea;
        this.view.content.hitArea = this.hitArea;

        let targetPosition: Point;
        if (this.view.tile.parent !== finalTargetContainer) {
            const globalPosition = this.view.tile.parent!.toGlobal(this.view.tile.position);
            targetPosition = finalTargetContainer.toLocal(globalPosition);
        } else {
            targetPosition = this.view.tile.position.clone();
        }

        const tapParameters = this.parameters.tapParameters;
        const tapWasExecuted
            = (event.timeStamp - this.dragStartTime <= tapParameters.maxDuration)
            && Math.abs(targetPosition.x - this.dragStartPosition.x)
                <= tapParameters.maxDistance
            && Math.abs(targetPosition.y - this.dragStartPosition.y)
                <= tapParameters.maxDistance;

        const moveTargetModel = finalTarget?.model ?? finalSource?.model;        
        this.moveToDragTarget(moveTargetModel);
        if (tapWasExecuted) {
            this.onPointerTap(event);
        } else {
            this.rotateToDragTarget(moveTargetModel);
        }

        if (finalTarget) {
            this.setDragSource(finalTarget);
        }
        
        this.dragTarget = undefined;
        draggingTileData.view = undefined;        

        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);

        if (!finalSource && finalTarget) {
            this.initialContainer.removeTileView(this);
        }
    }

    private preventScrollOnWheel(event: WheelEvent): void {
        if (this.isDragging) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private getPointerIsMouseAndButtonIsNotLeft(event: PointerEvent): boolean {
        return event.pointerType === 'mouse' && event.button !== 0;
    }

    /**
     * Проверка попытки входа в ячейку-источник.
     * Исходная ячейка почему-то не определяется как целевая при перемещении
     * и не реагирует на события указателя.
     * Поэтому здесь мы смотрим, не попадает ли указатель в зону исходной ячейки,
     * чтобы её подсветить или, наоборот, чтобы убрать подсветку.
     * @param dragSource Исходная ячейка для перетаскивания
     * @param dragSourceTileWorldHitArea Зона захвата ячейки для перетаскивания
     * в координатах родителя
     * @param tileWorldPosition Координаты точки в мире координат,
     * где живёт модель элемента замощения)
     * @returns 
     */
    private tryToEnterToDragSource(
        dragSource: StaticTileView,
        dragSourceTileWorldHitArea: Polygon,
        tileWorldPosition: Point
    ): boolean {
        const pointerIsInHitArea = Algorithm.getPointIsInsidePolygon(
            tileWorldPosition,
            dragSourceTileWorldHitArea
        );
        
        if (!this.dragTarget && pointerIsInHitArea) {
            dragSource.onPointerEnter();
            return true;
        }
        
        if (this.dragTarget === dragSource && !pointerIsInHitArea) {
            dragSource.onPointerLeave();
        }

        return false;
    }

    private addTileToSelectedContainer(): void {
        this.saveGlobalPosition();
        this.selectedContainer.addChild(this.view.tile);
        if (this.dragSource) {
            if (!draggingTileData.viewport) {
                throw new Error('draggingTileData.viewport should be initialized');
            }
            this.view.tile.scale = draggingTileData.viewport.scale.x;
        } else {
            this.initialContainer.setScaleRelativeToScaleChangeGlobalRectangle(
                this.savedGlobalPosition, this);
        }
        this.restoreGlobalPosition();
    }

    private restoreTargetScale(): void {
        this.view.tile.scale = this.dragSource
            ? 1
            : this.initialContainer.initialTileScale;
    }

    private addTileToTargetContainerOnFixAsLocatedCorrectly(): void {
        if (this.targetContainer !== this.view.tile.parent) {
            this.saveGlobalPosition();
            this.targetContainer.addChild(this.view.tile);
            this.restoreTargetScale();
            this.restoreGlobalPosition();
            this.view.model.currentPositionPoint.copyFrom(this.view.tile.position);
        }
    }

    private saveGlobalPosition(): void {
        if (!this.view.tile.parent) {
            return;
        }
        const globalTilePosition = this.view.tile.parent.toGlobal(this.view.tile.position);
        this.savedGlobalPosition.copyFrom(globalTilePosition);
    }

    private restoreGlobalPosition(): void {
        if (!this.view.tile.parent) {
            return;
        }
        const newLocalPosition = this.view.tile.parent.toLocal(this.savedGlobalPosition);
        this.view.tile.position.copyFrom(newLocalPosition);
    }

    public setDragSource(dragSource?: StaticTileView): void {
        this.dragSource = dragSource;
        if (!dragSource) {
            this.dragSourceWorldHitArea = undefined;
            return;
        }

        const pivotPoint = dragSource.view.model.geometry.pivotPoint;
        const currentPositionPoint = dragSource.view.model.currentPositionPoint;
        
        const tileMatrix = new Matrix()
            .translate(-pivotPoint.x, -pivotPoint.y)
            .rotate(dragSource.view.model.currentRotationAngle)
            .translate(currentPositionPoint.x, currentPositionPoint.y);
        
        const tileWorldHitArea = Algorithm.getTransformedPolygon(
            dragSource.view.model.geometry.hitArea,
            tileMatrix
        );
        
        this.dragSourceWorldHitArea = tileWorldHitArea;
    }

    /**
     * Получение глобальных координат экрана в мировых координатах контента
     * (координаты, в которых живёт модель элемента замощения)
     * @param globalPoint Глобальные координаты
     * @returns Координаты, в которых живёт модель элемента замощения
     */
    private getTargetContainerPosition(globalPoint: Point): Point {
        return this.getTargetContainer().toLocal(globalPoint);
    }

    private getTargetContainer(): Container {
        return !this.dragSource
            ? this.initialContainer
            : this.targetContainer;
    }

    private removeEventListeners(): void {
        this.ticker.remove(this.boundOnRotationTicker);
        this.ticker.remove(this.boundOnMoveAfterDragTicker);
        this.view.tile.off('pointerdown', this.onPointerDown, this);
        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);
        window.removeEventListener('wheel', this.boundPreventScrollOnWheel);
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

        this.removeInteractivity();
        this.dragSource?.removeInteractivity();

        this.addTileToSelectedContainer();
        const filter = new GlowFilter(this.parameters.correctLocatedGlowFilterOptions);
        this.view.setFilter(filter);

        setTimeout(() => {
            this.removeFilters();
            this.addTileToTargetContainerOnFixAsLocatedCorrectly();
            const contentWithoutBevelFilter = this.view.createContent(false);
            this.view.replaceContent(contentWithoutBevelFilter);
        },  this.parameters.correctLocatedFilterShowTime);
    }

    private removeInteractivity(): void {
        this.view.tile.eventMode = "none";
        this.removeEventListeners();
    }

    public destroy(): void {
        this.removeEventListeners();
        this.view.destroy();
    }
}