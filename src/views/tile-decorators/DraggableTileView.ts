import {
    Texture,
    Container,
    Point,
    FederatedPointerEvent,
    Filter,
    Polygon,
    Matrix,
    IHitArea,
    Ticker,
    Color,
    Rectangle,
    Circle,
    Ellipse,
    RoundedRectangle
} from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { StaticTileView } from "./StaticTileView.ts";
import { draggingTileData } from "./DraggingTileData.ts";
import { TileView } from "../tiles/TileView.ts";
import { Algorithm } from "../../math/Algorithm.ts";
import { DraggableTileParameters } from "./DraggableTileParameters.ts";
import { TileLineContainer } from "../components/TileLineContainer.ts";
import { TileRotationController } from "../controllers/TileRotationController.ts";
import { TileMoveAfterDragController }
    from "../controllers/TileMoveAfterDragController.ts";
import { TileMoveInsideInitialContainerController }
    from "../controllers/TileMoveInsideInitialContainerController.ts";
import { TileMoveToInitialContainerController }
    from "../controllers/TileMoveToInitialContainerController.ts";
import { WheelController } from "../controllers/WheelController.ts";

/**
 * Класс декоратора представления подвижного элемента замощения
 */
export class DraggableTileView implements TileView {
    public static readonly draggingTileIsSelectedEventName: string
        = "draggingTileIsSelectedEvent";
    public static readonly draggingTileIsDeselectedEventName: string
        = "draggingTileIsDeselectedEvent";

    public readonly parameters: DraggableTileParameters;
    /**
     * Композиция: элемент замощения, который декорируется
     */
    public readonly view: TileView;
    /**
     * Сохраняемая область попадания.
     * При движении область попадания и события указателя отключаются,
     * чтобы события указателя были видны элементам мозаики ниже.
     * После окончания движения зона попадания восстанавливается.
     */
    private savedTileHitArea?: IHitArea;
    /**
     * Сохраняемая область попадания контента.
     */
    private savedContentHitArea?: IHitArea;
    /**
     * Контейнер, в котором фигура должна находиться, чтобы картинка была собрана
     */
    public readonly targetContainer: Container;
    /**
     * Контейнер, в который фигура переносится на время вращения и/или перетаскивания
     */
    public readonly selectedContainer: Container;

    public isMoving: boolean = false;

    public isDragging: boolean = false;
    private dragOffset: Point = new Point(0, 0);
    private dragStartPosition: Point = new Point(0, 0);
    private dragStartTime: number = 0;
    /**
     * Статическая фигура-ячейка, с которой происходит перетаскивание
     */
    public dragSource?: StaticTileView;
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
    public readonly initialContainer: TileLineContainer;

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
    private fixAsLocatedCorrectlyTimer?: number;

    private selectedGlowFilter?: GlowFilter;
    private correctLocatedGlowFilter?: GlowFilter;

    private readonly rotationController: TileRotationController;
    private readonly moveAfterDragController: TileMoveAfterDragController;
    private readonly moveInsideInitialContainerController:
        TileMoveInsideInitialContainerController;
    private readonly moveToInitialContainerController: TileMoveToInitialContainerController;

    //#region Отладочная информация

    private static onPointerDownCount: number = 0;
    private static onGlobalPointerMoveCount: number = 0;
    private static onPointerUpCount: number = 0;
    private static onPointerLeaveCount: number = 0;

    //#endregion Отладочная информация

    private boundOnGlobalPointerUp: (event: PointerEvent) => void
        = this.onGlobalPointerUp.bind(this);
    private boundOnGlobalPointerLeave: () => void = this.onGlobalPointerLeave.bind(this);

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

        this.rotationController = new TileRotationController(this, ticker);
        this.moveAfterDragController = new TileMoveAfterDragController(this, ticker);
        this.moveInsideInitialContainerController
            = new TileMoveInsideInitialContainerController(this, ticker);
        this.moveToInitialContainerController = new TileMoveToInitialContainerController(
            this, ticker);

        this.view.tile.eventMode = "static";
        this.view.tile.on('pointerdown', this.onPointerDown, this);
        DraggableTileView.onPointerDownCount++;
        //DraggableTileView.logPointerDown();

        this.saveHitArea();
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

    //#region Отладочная информация

    public static logPointerDown() {
        console.log(`onPointerDownCount: ${DraggableTileView.onPointerDownCount}`);
    }

    public static logGlobalPointerMove() {
        console.log(`onGlobalPointerMoveCount: ${DraggableTileView.onGlobalPointerMoveCount}`);
    }

    public static logPointerUp() {
        console.log(`onPointerUpCount: ${DraggableTileView.onPointerUpCount}`);
    }

    public static logPointerLeave() {
        console.log(`onPointerLeaveCount: ${DraggableTileView.onPointerLeaveCount}`);
    }

    //#endregion Отладочная информация

    private saveHitArea(): void {
        if (this.view.tile.hitArea) {
            this.savedTileHitArea = this.cloneHitArea(this.view.tile.hitArea);
        }        
        if (this.view.content.hitArea) {
            this.savedContentHitArea = this.cloneHitArea(this.view.content.hitArea);
        }
    }

    private cloneHitArea(hitArea: IHitArea): IHitArea | undefined {
        if (!hitArea) { 
            return undefined;
        }
        
        if (hitArea instanceof Polygon) {
            return new Polygon([...hitArea.points]);
        } else if (hitArea instanceof Rectangle) {
            return new Rectangle(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
        } else if (hitArea instanceof Circle) {
            return new Circle(hitArea.x, hitArea.y, hitArea.radius);
        } else if (hitArea instanceof Ellipse) {
            return new Ellipse(hitArea.x, hitArea.y, hitArea.halfWidth, hitArea.halfHeight);
        } else if (hitArea instanceof RoundedRectangle) {
            return new RoundedRectangle(
                hitArea.x,
                hitArea.y,
                hitArea.width,
                hitArea.height,
                hitArea.radius
            );
        }
        
        return hitArea;
    }

    private clearHitArea(): void {
        this.savedTileHitArea = undefined;
        this.savedContentHitArea = undefined;
    }

    private disableHitArea(): void {
        if (!this.savedTileHitArea && this.view.tile.hitArea) {
            this.savedTileHitArea = this.cloneHitArea(this.view.tile.hitArea);
        }
        if (!this.savedContentHitArea && this.view.content.hitArea) {
            this.savedContentHitArea = this.cloneHitArea(this.view.content.hitArea);
        }        
        this.view.tile.hitArea = undefined;
        this.view.content.hitArea = undefined;
    }

    private restoreHitArea(): void {
        this.view.tile.hitArea = this.savedTileHitArea 
            ? this.cloneHitArea(this.savedTileHitArea) 
            : undefined;
        this.view.content.hitArea = this.savedContentHitArea 
            ? this.cloneHitArea(this.savedContentHitArea) 
            : undefined;
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
            DraggableTileView.onPointerDownCount++;
        } else {
            this.view.tile.off('pointerdown', this.onPointerDown, this);
            DraggableTileView.onPointerDownCount--;
        }
        //DraggableTileView.logPointerDown();
    }

    private onPointerTap(event: PointerEvent): void {
        if (this.getPointerIsMouseAndButtonIsNotLeft(event)) {
            return;
        }
        this.rotationController.stop();
        this.rotationController.hasDragTarget = !!this.dragTarget;
        const rotationAngleDifference = this.view.model
            .getSamePositionNextAngleMinAngleDifference();
        this.rotationController.start(rotationAngleDifference);
    }

    public rotateToDragTarget(dragTargetModel?: TileModel): void {
        this.rotationController.restart(dragTargetModel);
    }

    public moveToDragTarget(dragTargetModel?: TileModel): void {
        this.moveAfterDragController.restart(dragTargetModel);        
    }

    public moveInsideInitialContainer(targetPoint: Point): void {
        this.moveInsideInitialContainerController.restart(targetPoint);     
    }

    public moveToInitialContainer(targetGlobalPosition: Point): void {
        this.moveToInitialContainerController.stop();
        this.moveAfterDragController.stop();
        this.moveInsideInitialContainerController.stop();
        this.rotationController.stop();

        this.moveToInitialContainerController.restart(targetGlobalPosition);
    }

    public addTileToContainer(container: Container): void {
        this.saveGlobalPosition();
        container.addChild(this.view.tile);
        this.restoreTargetScale();
        this.restoreGlobalPosition();
    }

    public dispatchDraggingTileIsSelectedEvent(): void {
        const event = new CustomEvent<DraggableTileView>(
            DraggableTileView.draggingTileIsSelectedEventName,
            { detail: this }
        );
        window.dispatchEvent(event);
    }

    public dispatchDraggingTileIsDeselectedEvent(): void {
        const event = new CustomEvent<DraggableTileView>(
            DraggableTileView.draggingTileIsDeselectedEventName,
            { detail: this }
        );
        window.dispatchEvent(event);
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
            WheelController.getInstance().setScrollOnWheelActivity(false);
        }

        this.isDragging = true;
        draggingTileData.view = this;
        draggingTileData.animatingViews.add(this);
        this.dispatchDraggingTileIsSelectedEvent();

        this.setOnPointerDownActivity(false);
        this.view.tile.on('globalpointermove', this.onPointerMove, this);
        DraggableTileView.onGlobalPointerMoveCount++;
        //DraggableTileView.logGlobalPointerMove();
        window.addEventListener('pointerup', this.boundOnGlobalPointerUp);
        DraggableTileView.onPointerUpCount++;
        //DraggableTileView.logPointerUp();
        document.addEventListener('pointerleave', this.boundOnGlobalPointerLeave);
        DraggableTileView.onPointerLeaveCount++;
        //DraggableTileView.logPointerLeave();

        this.dragTarget = this.dragSource;
        this.dragStartPosition = this.view.tile.position.clone();
        this.dragStartTime = event.timeStamp;
        
        const globalPosition = new Point(event.global.x, event.global.y);
        const targetPosition = this.getTargetParentPosition(globalPosition);

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
        
        const filter = this.getSelectedGlowFilter();
        this.view.setFilter(filter);

        // Убираем зону попадания, чтобы события указателя были видны
        // статическим элементам замощения уровнем ниже
        this.disableHitArea();
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

        const targetPosition = this.getTargetParentPosition(globalPosition);

        if (this.dragSource && this.dragSourceWorldHitArea) {
            this.tryToEnterToDragSource(
                this.dragSource,
                this.dragSourceWorldHitArea,
                targetPosition
            );
        }
    }

    public onGlobalPointerUp(event: PointerEvent): void {
        this.onGlobalPointerUpOrLeave(event);
    }

    public onGlobalPointerLeave(): void {
        this.onGlobalPointerUpOrLeave();
    }

    private onGlobalPointerUpOrLeave(event?: PointerEvent): void {
        if (!this.isDragging || draggingTileData.view !== this) {
            return;
        }

        if (event?.pointerType === 'touch') {
            if (this.pointerDownId === event.pointerId) {
                this.pointerDownId = undefined;
            } else {
                return;
            }
        }

        this.isDragging = false;   

        const finalTarget = this.dragTarget;
        const finalSource = this.dragSource;
        const finalTargetContainer = !finalTarget
            ? this.initialContainer
            : this.targetContainer;
        
        if (finalTarget) {
            finalTarget.stopBeingDragTarget();
        } else if (finalSource) {
            finalSource.stopBeingDragTarget();
        }

        // Восстанавливаем зону попадания, чтобы снова получать события указателя
        this.restoreHitArea();

        const globalPosition = this.getGlobalPosition();
        const targetPosition = this.view.tile.parent !== finalTargetContainer
            ? finalTargetContainer.toLocal(globalPosition)
            : this.view.tile.position.clone();

        const tapParameters = this.parameters.tapParameters;
        const tapWasExecuted
            = event
            && (event.timeStamp - this.dragStartTime <= tapParameters.maxDuration)
            && Math.abs(targetPosition.x - this.dragStartPosition.x)
                <= tapParameters.maxDistance
            && Math.abs(targetPosition.y - this.dragStartPosition.y)
                <= tapParameters.maxDistance;

        let shouldAddToInitialContainer = false;
        if (finalSource) {
            const isInsideViewportRectangle = draggingTileData.viewport
                ?.getPointIsInsideViewportRectangle(globalPosition) ?? false;
            shouldAddToInitialContainer = !isInsideViewportRectangle;
        }
        
        if (!shouldAddToInitialContainer) {
            const moveTargetModel = finalTarget?.model ?? finalSource?.model;        
            this.moveToDragTarget(moveTargetModel);
            if (tapWasExecuted) {
                this.onPointerTap(event);
            } else {
                this.rotateToDragTarget(moveTargetModel);
            }
        }

        if (finalTarget) {
            this.setDragSource(finalTarget);
        }
        
        this.dragTarget = this.dragSource;
        draggingTileData.view = undefined;
        this.dispatchDraggingTileIsDeselectedEvent();      

        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        DraggableTileView.onGlobalPointerMoveCount--;
        //DraggableTileView.logGlobalPointerMove();
        window.removeEventListener('pointerup', this.boundOnGlobalPointerUp);
        DraggableTileView.onPointerUpCount--;
        //DraggableTileView.logPointerUp();
        document.removeEventListener('pointerleave', this.boundOnGlobalPointerLeave);
        DraggableTileView.onPointerLeaveCount--;
        //DraggableTileView.logPointerLeave();

        if (!finalSource && finalTarget) {
            this.initialContainer.removeTileView(this);
        } else if (shouldAddToInitialContainer) {
            this.dragSource = undefined;
            this.dragTarget = undefined;
            this.initialContainer.addTileView(this);
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
        const pointerIsInsideHitArea = Algorithm.getPointIsInsidePolygon(
            tileWorldPosition,
            dragSourceTileWorldHitArea
        );
        
        if (pointerIsInsideHitArea) {
            dragSource.onPointerEnter();
            return true;
        }
        
        if (this.dragTarget === dragSource && !pointerIsInsideHitArea) {
            dragSource.onPointerLeave();
        }

        return false;
    }

    public addTileToSelectedContainer(): void {
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
        }
    }

    private saveGlobalPosition(): void {
        const globalPosition = this.getGlobalPosition();
        this.savedGlobalPosition.copyFrom(globalPosition);
    }

    private restoreGlobalPosition(): void {
        const localPosition = this.view.tile.parent
            ? this.view.tile.parent.toLocal(this.savedGlobalPosition)
            : this.savedGlobalPosition;
        this.view.tile.position.copyFrom(localPosition);
        this.view.model.currentPositionPoint.copyFrom(localPosition);
    }

    public getGlobalPosition(): Point {
        return this.view.tile.parent?.toGlobal(this.view.tile.position)
            ?? this.view.tile.position;
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

    private getTargetParentPosition(globalPoint: Point): Point {
        const targetParent = !this.dragSource
            ? this.initialContainer
            : this.targetContainer;
        return targetParent.toLocal(globalPoint);
    }

    private removeEventListeners(): void {
        this.rotationController.removeEventListeners();
        this.moveAfterDragController.removeEventListeners();
        this.moveInsideInitialContainerController.removeEventListeners();
        this.moveToInitialContainerController.removeEventListeners(); 

        this.view.tile.off('pointerdown', this.onPointerDown, this);
        DraggableTileView.onPointerDownCount--;
        //DraggableTileView.logPointerDown();

        this.view.tile.off('globalpointermove', this.onPointerMove, this);
        DraggableTileView.onGlobalPointerMoveCount--;
        //DraggableTileView.logGlobalPointerMove();

        window.removeEventListener('pointerup', this.boundOnGlobalPointerUp); 
        DraggableTileView.onPointerUpCount--;
        //DraggableTileView.logPointerUp();

        document.removeEventListener('pointerleave', this.boundOnGlobalPointerLeave);
        DraggableTileView.onPointerLeaveCount--;
        //DraggableTileView.logPointerLeave();
    }

    /**
     * Фиксация элемента мозаики на своём месте после того, как он принял правильное положение.
     * Элемент мозаики подсвечивается, потом погасает.
     * Выдавленная рамка убирается, и фигура становится часть картинки.
     * Реакция на события указателя пропадает.
     */
    public fixAsLocatedCorrectly(): void {
        if (this.isLocatedCorrectly) {
            return;
        }
        this.isLocatedCorrectly = true;

        this.removeInteractivity();
        this.dragSource?.removeInteractivity();

        this.addTileToSelectedContainer();
        const filter = this.getCorrectLocatedGlowFilter();
        this.view.setFilter(filter);

        if (this.fixAsLocatedCorrectlyTimer !== null) {
            clearTimeout(this.fixAsLocatedCorrectlyTimer);
        }

        this.fixAsLocatedCorrectlyTimer = setTimeout(() => {
                this.removeFilters();
                this.addTileToTargetContainerOnFixAsLocatedCorrectly();
                const contentWithoutBevelFilter = this.view.createContent(false);
                this.view.replaceContent(contentWithoutBevelFilter);
                this.fixAsLocatedCorrectlyTimer = undefined;
            }, 
            this.parameters.correctLocatedFilterShowTime
        );
    }

    public getSelectedGlowFilter(): GlowFilter {
        if (!this.selectedGlowFilter) {
            this.selectedGlowFilter = new GlowFilter(this.parameters.selectedGlowFilterOptions);
        }
        return this.selectedGlowFilter;
    }

    private getCorrectLocatedGlowFilter(): GlowFilter {
        if (!this.correctLocatedGlowFilter) {
            this.correctLocatedGlowFilter
                = new GlowFilter(this.parameters.correctLocatedGlowFilterOptions);
        }
        return this.correctLocatedGlowFilter;
    }

    private removeInteractivity(): void {
        this.view.tile.eventMode = "none";
        this.removeEventListeners();
    }

    public destroy(): void {
        if (this.fixAsLocatedCorrectlyTimer) {
            clearTimeout(this.fixAsLocatedCorrectlyTimer);
            this.fixAsLocatedCorrectlyTimer = undefined;
        }

        this.removeEventListeners();

        this.view.tile.hitArea = undefined;
        this.view.content.hitArea = undefined;
        this.clearHitArea();
        this.dragSourceWorldHitArea = undefined;
        
        this.rotationController.destroy();
        this.moveAfterDragController.destroy();
        this.moveInsideInitialContainerController.destroy();
        this.moveToInitialContainerController.destroy();

        this.view.removeFilters();
        if (this.selectedGlowFilter) {
            this.selectedGlowFilter.destroy();
            this.selectedGlowFilter = undefined;
        }
        if (this.correctLocatedGlowFilter) {
            this.correctLocatedGlowFilter.destroy();
            this.correctLocatedGlowFilter = undefined;
        }

        if (draggingTileData.view === this) {
            draggingTileData.view = undefined;
        }
        draggingTileData.animatingViews.delete(this);

        this.dragSource = undefined;
        this.dragTarget = undefined;
        
        this.view.destroy();
    }
}