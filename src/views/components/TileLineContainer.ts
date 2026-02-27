import { 
    Color,
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Point,
    Rectangle,
    Renderer,
    Ticker
} from "pixi.js";
import { TileLineParameters } from "./TileLineParameters.ts";
import { TilingView } from "../tilings/TilingView.ts";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";
import { TileViewCreationParameters } from "../tiles/TileViewCreationParameters.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { Size } from "../../math/Size.ts";
import { TileLineLayoutType } from "./TileLineLayoutType.ts";
import { Algorithm } from "../../math/Algorithm.ts";
import { TileView } from "../tiles/TileView.ts";
import { ViewportContainer } from "./ViewportContainer.ts";
import { TileLineResizeController } from "../controllers/TileLineResizeController.ts";

/**
 * Класс контейнера линии, в которой содержатся элементы мозаики для сборки.
 * Может быть вертикальной (сверху вниз) или горизонтальной (слева направо).
 */
export class TileLineContainer extends Container {
    public readonly parameters: TileLineParameters;
    private readonly tilingView: TilingView;
    /**
     * Продольный размер.
     * Для направления слева направо это ширина.
     * Для направления сверху вниз это высота.
     */
    public longitudinalSize: number;
    /**
     * Поперечный размер.
     * Для направления слева направо это высота.
     * Для направления сверху вниз это ширина.
     */
    private readonly transverseSize: number;
    /**
     * Изначальный масштаб элемента мозаики, когда он лежит на ленте,
     * чтобы фигура полностью вписывалась в ленту
     */
    public readonly initialTileScale: number;
    /**
     * Прямоугольная зона изменения масштаба элемента мозаики.
     * Когда пользователь захватывает фигуру и начинает двигать,
     * то в этой зоне масштаб фигуры постепенно меняется с изначального масштаба на ленте
     * на масштаб viewport-а замощения.
     * Эта зона определяется на основе типа выравнивания ленты.
     */
    private scaleChangeGlobalRectangle?: Rectangle;
    /**
     * Максимальный предельный размер масштабированного элемента мозаики.
     */
    private readonly maxScaledBoundingSize: number;

    private viewportContainer?: ViewportContainer;
    private readonly selectedContainer: Container;

    public readonly backgroundContainer: Container;
    private backgroundFillColor: Color = new Color(0x00AA00);

    public tileViews: DraggableTileView[] = [];

    public isResizing: boolean = false;
    public targetLongitudinalSize: number = 0;

    private readonly resizeController: TileLineResizeController;

    constructor(
        parameters: TileLineParameters,
        transverseSize: number,
        tilingView: TilingView,
        selectedContainer: Container,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>        
    ) {
        super(options);
        this.parameters = parameters;
        this.transverseSize = transverseSize;
        this.tilingView = tilingView;
        this.selectedContainer = selectedContainer;

        this.resizeController = new TileLineResizeController(this, ticker);

        this.maxScaledBoundingSize = this.transverseSize
            - 2 * this.parameters.transverseContentOffset;

        const tileCount = this.tilingView.model.shuffledTilePositions.length;
        this.longitudinalSize = 2 * this.parameters.longitudinalContentOffset
            + tileCount * this.maxScaledBoundingSize
            + (tileCount - 1) * this.parameters.betweenTilesOffset;

        const size = this.getSizeByDirection();
        this.width = size.width;
        this.height = size.height;
        
        this.initialTileScale = this.maxScaledBoundingSize
            / this.tilingView.model.maxTileBoundingSize;

        this.backgroundContainer = this.createBackground();
        this.addChild(this.backgroundContainer);
    }

    private getViewportContainerOrThrow(): ViewportContainer {
        if (!this.viewportContainer) {
            throw new Error('viewportContainer is not defined');
        }
        return this.viewportContainer;
    }

    /**
     * Метод, который нужно вызывать после добавления данного контейнера к родителю.
     * Устанавливает зону изменения масштабирования
     */
    public onAddedToParent(viewportContainer: ViewportContainer): void {
        this.viewportContainer = viewportContainer;
        this.scaleChangeGlobalRectangle = this.getTileScaleChangeGlobalRectangle();
    }

    public getPointIsInsideViewportRectangle(globalPoint: Point): boolean {
        return Algorithm.getPointIsInsideRectangle(
            globalPoint,
            this.getViewportContainerOrThrow().getViewportGlobalRectangle()
        );
    }

    private getTileScaleChangeGlobalRectangle(): Rectangle {
        const viewportContainer = this.getViewportContainerOrThrow();
        const viewportRectangle = viewportContainer.viewportRectangle;
        const globalLeftTop = viewportContainer.viewportGlobalPosition;
        const widthHalf = this.width / 2.0;
        const heightHalf = this.height / 2.0;

        switch (this.parameters.layoutType) {
            case TileLineLayoutType.Top:
                return new Rectangle(
                    globalLeftTop.x,
                    globalLeftTop.y + heightHalf,
                    viewportRectangle.width,
                    heightHalf
                );
            case TileLineLayoutType.Left:
                return new Rectangle(
                    globalLeftTop.x + widthHalf,
                    globalLeftTop.y,
                    widthHalf,
                    viewportRectangle.height
                );
            case TileLineLayoutType.Bottom:
                return new Rectangle(
                    globalLeftTop.x,
                    globalLeftTop.y,
                    viewportRectangle.width,
                    heightHalf
                );
            case TileLineLayoutType.Right:
                return new Rectangle(
                    globalLeftTop.x,
                    globalLeftTop.y,
                    widthHalf,
                    viewportRectangle.height
                );
            default:
                return new Rectangle(0, 0, 0, 0);
        }
    }

    private createBackground(): Container {
        const size = this.getSizeByDirection();
        const graphics = new Graphics()
            .rect(0, 0, size.width, size.height)
            .fill({ color: this.backgroundFillColor });
        graphics.cacheAsTexture(true);
        return graphics;
    }

    public createDraggableTileViews(renderer: Renderer, ticker: Ticker): void {
        const staticViewsWereCreated = !!this.tilingView.staticTileViewsByTilePositionStrings
            .size;
        if (!staticViewsWereCreated) {
            throw new Error('static tiles were not created');
        }
        if (!this.tilingView.model.shuffledTilePositions) {
            throw new Error('shuffledTilePositions were not filled');
        }

        const viewFactory = new TileViewFactory();
        const transverseCoordinate = this.getTileTransverseCoordinate();
        const longitudinalCoordinateOffset = this.getTileLongitudinalCoordinateOffset();
        const longitudinalCoordinateMultiplier = this.getTileLongitudinalCoordinateMultiplier();
        
        for (
            let positionIndex = 0;
            positionIndex < this.tilingView.model.shuffledTilePositions.length;
            positionIndex++
        ) {
            const position = this.tilingView.model.shuffledTilePositions[positionIndex];
            const staticView = this.tilingView.staticTileViewsByTilePositionStrings.get(
                position.toString());
            if (!staticView) {
                continue;
            }

            const model = staticView.model.clone();
            const rotationAngle = Math.random() * 2 * Math.PI;
            model.currentRotationAngle = rotationAngle;
            model.currentTargetRotationAngle = rotationAngle;
            model.targetTilePosition.shuffledIndex = positionIndex;

            const longitudinalCoordinate = longitudinalCoordinateOffset
                + position.shuffledIndex * longitudinalCoordinateMultiplier;
            model.currentPositionPoint = this.getPoint(longitudinalCoordinate,
                transverseCoordinate);

            const viewCreationParameters: TileViewCreationParameters = {
                model: model,
                texture: this.tilingView.model.getTileTexture(model),
                renderer,
                replacingTextureFillColor: this.tilingView.staticTileFillColor
            };
            const view = viewFactory.getView(
                this.parameters.tileParameters,
                viewCreationParameters
            );
            view.tile.scale = this.initialTileScale;

            this.addChild(view.tile);

            this.tileViews.push(new DraggableTileView(
                this.parameters.draggableTileParameters,
                view,
                this,
                this.tilingView.draggableTilesContainer,
                this.selectedContainer,
                ticker
            ));
        }
    }

    public resize(targetLongitudinalSize: number): void {
        this.resizeController.stop();

        const bounds = this.backgroundContainer.getBounds();
        const globalRightBottom = new Point(bounds.right, bounds.bottom);
        const viewportRectangle = this.getViewportContainerOrThrow().viewportRectangle;
        const viewportRightBottom = new Point(
            viewportRectangle.x + viewportRectangle.width,
            viewportRectangle.y + viewportRectangle.height
        );

        const offset = this.getTileLongitudinalCoordinateMultiplier();
        const endIsVisible = this.parameters.directionType
            === TileLineDirectionType.FromLeftToRight
            ? globalRightBottom.x <= viewportRightBottom.x + offset
            : globalRightBottom.y <= viewportRightBottom.y + offset;

        if (endIsVisible) {
            this.resizeController.start(targetLongitudinalSize - this.longitudinalSize);
        } else {
            this.resizeWithoutAnimation(targetLongitudinalSize);
        }
    }

    public resizeWithoutAnimation(targetLongitudinalSize: number): void {
        if (this.parameters.directionType === TileLineDirectionType.FromLeftToRight) {
            this.backgroundContainer.width = targetLongitudinalSize;            
        } else {
            this.backgroundContainer.height = targetLongitudinalSize;
        }

        this.backgroundContainer.updateCacheTexture();

        this.longitudinalSize = targetLongitudinalSize;

        this.getViewportContainerOrThrow().setContentSize(
            this.backgroundContainer.width,
            this.backgroundContainer.height
        );
    }

    public setScaleRelativeToScaleChangeGlobalRectangle(
        globalPoint: Point,
        tileView: DraggableTileView
    ): void {
        if (!this.scaleChangeGlobalRectangle) {
            throw new Error('tileScaleChangeGlobalRectangle was not created');
        }

        const shouldChangeScale = Algorithm.getPointIsInsideRectangle(
            globalPoint,
            this.scaleChangeGlobalRectangle
        );
        if (!shouldChangeScale) {
            return;
        }
        
        if (!draggingTileData.viewport) {
            throw new Error('draggingTileData.viewport should be initialized');
        }

        const tilingViewportScale = draggingTileData.viewport.scale.x;
        const scaleDifference = tilingViewportScale - this.initialTileScale;
        const coordinateDifference = this.parameters.layoutType === TileLineLayoutType.Top
            || this.parameters.layoutType === TileLineLayoutType.Bottom
            ? this.scaleChangeGlobalRectangle.height
            : this.scaleChangeGlobalRectangle.width;
        const scaleToCoordinateRatio = scaleDifference / coordinateDifference;

        let coordinateDistance: number;
        switch (this.parameters.layoutType) {
            case TileLineLayoutType.Top:
                coordinateDistance = globalPoint.y - this.scaleChangeGlobalRectangle.y;
                break;
            case TileLineLayoutType.Bottom:
                coordinateDistance = this.scaleChangeGlobalRectangle.y
                    + this.scaleChangeGlobalRectangle.height
                    - globalPoint.y;
                break;
            case TileLineLayoutType.Left:
                coordinateDistance = globalPoint.x - this.scaleChangeGlobalRectangle.x;
                break;            
            case TileLineLayoutType.Right:
                coordinateDistance = this.scaleChangeGlobalRectangle.x
                    + this.scaleChangeGlobalRectangle.width
                    - globalPoint.x;
                break;
            default:
                coordinateDistance = 0;
                break;
        }

        tileView.view.tile.scale = this.initialTileScale
            + scaleToCoordinateRatio * coordinateDistance;
    }

    /**
     * Удаление фигуры с ленты.
     * Фигура удаляется из массива, а также фигуры справа от неё подвигаются,
     * чтобы не было пробела.
     * @param tileView Удаляемая перетаскиваемая фигура
     */
    public removeTileView(tileView: DraggableTileView): void {
        const removingTileIndex = tileView.model.targetTilePosition.shuffledIndex;
        if (this.tileViews[removingTileIndex] !== tileView) {
            return;
        }

        const visibleMovingTiles: DraggableTileView[] = [];
        const targetPositions: Point[] = [];
        let lastMovingTileIndex = -1;

        // Эти фигуры видны, поэтому у них будет анимация движения
        for (
            let tileIndex = removingTileIndex + 1;
            tileIndex < this.tileViews.length;
            tileIndex++
        ) {
            const tile = this.tileViews[tileIndex];
            if (this.getTileIsVisibleInViewportContainer(tile)) {
                visibleMovingTiles.push(tile);
                const previousTile = this.tileViews[tileIndex - 1];
                targetPositions.push(previousTile.model.currentPositionPoint.clone());
            } else {
                lastMovingTileIndex = tileIndex;
                break;
            }
        }

        // Фигуры движутся влево, поэтому ещё одну невидимую фигуру захватим,
        // потому что она подвинется и станет видимой
        if (
            lastMovingTileIndex > 0
            && lastMovingTileIndex < this.tileViews.length
        ) {
            visibleMovingTiles.push(this.tileViews[lastMovingTileIndex]);
            const previousTile = this.tileViews[lastMovingTileIndex - 1];
            targetPositions.push(previousTile.model.currentPositionPoint.clone());
        }

        // Корректирую первую позицию,
        // потому что удаляемая фигурка уже улетела в другой контейнер.
        if (targetPositions.length && removingTileIndex + 1 < this.tileViews.length) {
            const afterRemovingFirstPosition
                = this.tileViews[removingTileIndex + 1].model.currentPositionPoint;
            targetPositions[0] = this.getPreviousTilePositionPoint(afterRemovingFirstPosition);
        }        

        for (let tileIndex = 0; tileIndex < visibleMovingTiles.length; tileIndex++) {
            visibleMovingTiles[tileIndex].moveInsideInitialContainer(targetPositions[tileIndex]);
            visibleMovingTiles[tileIndex].model.targetTilePosition.shuffledIndex--;
        }

        // Остальные фигуры справа просто поменяют координаты, потому что их не видно
        if (lastMovingTileIndex > 0) {
            for (
                let tileIndex = this.tileViews.length - 1;
                tileIndex >= lastMovingTileIndex + 1;
                tileIndex--
            ) {
                const previousTilePosition = this.tileViews[tileIndex - 1].model.currentPositionPoint;
                const tile = this.tileViews[tileIndex];
                tile.model.currentPositionPoint.copyFrom(previousTilePosition);
                tile.tile.position.copyFrom(previousTilePosition);
                tile.model.targetTilePosition.shuffledIndex--;
            }
        }

        this.tileViews.splice(removingTileIndex, 1);

        const newSize = this.tileViews.length
            ? this.longitudinalSize - this.getTileLongitudinalCoordinateMultiplier()
            : 0;
        this.resize(newSize);
    }

    /**
     * Добавление фигуры на ленту.
     * Фигура добавляется в массив, а также фигуры справа от неё подвигаются.
     * @param tileView Добавляемая перетаскиваемая фигура
     */
    public addTileView(tileView: DraggableTileView): void {
        const viewportContainer = this.getViewportContainerOrThrow();
        const viewportGlobalRectangle = viewportContainer.getViewportGlobalRectangle();

        // Добавляем новый единственный элемент мозаики в пустой массив
        if (!this.tileViews.length) {
            tileView.model.targetTilePosition.shuffledIndex = 0;
            
            const targetGlobalPosition = new Point(
                viewportGlobalRectangle.x + viewportGlobalRectangle.width / 2.0,
                viewportGlobalRectangle.y + viewportGlobalRectangle.height / 2.0
            );

            tileView.moveToInitialContainer(targetGlobalPosition);
            this.tileViews.push(tileView);

            this.backgroundContainer.visible = true;
            const newSize = 2 * this.parameters.longitudinalContentOffset
                + this.maxScaledBoundingSize;
            this.resize(newSize);
            return;            
        }

        const globalPosition = tileView.getGlobalPosition();
        const localPosition = this.toLocal(globalPosition);
        const isHorizontal = this.parameters.directionType
            === TileLineDirectionType.FromLeftToRight;

        const coordinate = isHorizontal ? localPosition.x : localPosition.y;       
        const coordinates = isHorizontal
            ? this.tileViews.map(tileView => tileView.tile.position.x)
            : this.tileViews.map(tileView => tileView.tile.position.y);

        const shuffledIndex = coordinate < coordinates[0]
            ? 0
            : coordinate > coordinates[coordinates.length - 1]
                ? coordinates.length
                : Algorithm.findSegmentIndex(coordinates, coordinate);

        tileView.model.targetTilePosition.shuffledIndex = shuffledIndex;
        for (let tileIndex = shuffledIndex; tileIndex < this.tileViews.length; tileIndex++) {
            const tileViews = this.tileViews[tileIndex];
            tileViews.model.targetTilePosition.shuffledIndex++;
            tileViews.moveInsideInitialContainer(this.getTilePositionPoint(tileIndex + 1));
        }

        const sizeDifference = this.getTileLongitudinalCoordinateMultiplier();
        const newSize = this.longitudinalSize + sizeDifference;

        const viewportSize = isHorizontal
            ? viewportGlobalRectangle.width
            : viewportGlobalRectangle.height;

        const targetLocalPosition = this.getTilePositionPoint(shuffledIndex);
        const thisGlobalPosition = this.parent?.toGlobal(this.position) ?? this.position;

        let thisNewGlobalPosition: number;
        if (newSize < viewportSize) {
            // При малой ширине полоски происходит её центрирование во вьюпорте
            const viewportSizeDifferenceHalf = (viewportSize - newSize) / 2.0;
            thisNewGlobalPosition = isHorizontal
                ? viewportGlobalRectangle.x + viewportSizeDifferenceHalf
                : viewportGlobalRectangle.y + viewportSizeDifferenceHalf;
        } else {
            // Корректировка позиции в границах вьюпорта
            thisNewGlobalPosition = isHorizontal
                ? viewportContainer.getClampedX(thisGlobalPosition.x, newSize)
                : viewportContainer.getClampedY(thisGlobalPosition.y, newSize);
        }

        const targetGlobalPosition = new Point(
            isHorizontal
                ? thisNewGlobalPosition + targetLocalPosition.x
                : targetLocalPosition.x + viewportGlobalRectangle.x,
            isHorizontal
                ? targetLocalPosition.y + viewportGlobalRectangle.y
                : thisNewGlobalPosition + targetLocalPosition.y
        );

        tileView.moveToInitialContainer(targetGlobalPosition);
        if (shuffledIndex >= this.tileViews.length) {
            this.tileViews.push(tileView);
        } else {
            this.tileViews.splice(shuffledIndex, 0, tileView);
        }

        this.resize(newSize);        
    }

    private getTileIsVisibleInViewportContainer(tileView: TileView): boolean {
        const viewportContainer = this.getViewportContainerOrThrow();

        const tileSizeHalf = tileView.model.geometry.maxBoundingSize * this.initialTileScale / 2.0;
        const tileGlobalPosition = tileView.tile.parent
            ? tileView.tile.parent.toGlobal(tileView.tile.position)
            : tileView.tile.position;
        const viewportContainerPosition = new Point(viewportContainer.x,
            viewportContainer.y);
        const viewportContainerGlobalPosition = viewportContainer.parent
            ? viewportContainer.parent.toGlobal(viewportContainerPosition)
            : viewportContainerPosition;
        
        let tileLongitudinalCoordinate: number;
        let viewportLongitudinalCoordinate: number;
        let viewportLongitudinalSize: number;

        if (this.parameters.directionType === TileLineDirectionType.FromLeftToRight) {
            tileLongitudinalCoordinate = tileGlobalPosition.x;
            viewportLongitudinalCoordinate = viewportContainerGlobalPosition.x;
            viewportLongitudinalSize = viewportContainer.viewportRectangle.width;
        } else {
            tileLongitudinalCoordinate = tileGlobalPosition.y;
            viewportLongitudinalCoordinate = viewportContainerGlobalPosition.y;
            viewportLongitudinalSize = viewportContainer.viewportRectangle.height;
        }

        return tileLongitudinalCoordinate + tileSizeHalf > viewportLongitudinalCoordinate
            && tileLongitudinalCoordinate - tileSizeHalf
            < viewportLongitudinalCoordinate + viewportLongitudinalSize;
    }

    public getPreviousTilePositionPoint(tilePositionPoint: Point): Point {
        return this.getNeighborTilePositionPoint(tilePositionPoint, -1);
    }

    /**
     * Получение координат соседнего элемента замощения
     * @param currentPositionPoint Координаты текущей фигуры
     * @param relativeNeighborIndex Относительный индекс соседней фигуры:
     * 0 - та же самая фигура, 1 - соседняя фигура слева, -1 - соседняя фигура справа,
     * -2 - фигура справа через одну и тому подобное.
     * @returns Координаты соседнего элемента замощения
     */
    private getNeighborTilePositionPoint(
        currentPositionPoint: Point,
        relativeNeighborIndex: number
    ): Point {
        const result = currentPositionPoint.clone();
        const offset = this.getTileLongitudinalCoordinateMultiplier()
            * relativeNeighborIndex;
        if (this.parameters.directionType === TileLineDirectionType.FromLeftToRight) {
            result.x += offset;
        } else {
            result.y += offset;
        }
        return result;
    }

    public getTilePositionPoint(shuffledIndex: number,): Point {
        const transverseCoordinate = this.getTileTransverseCoordinate();
        const longitudinalCoordinate = this.getTileLongitudinalCoordinateOffset()
            + shuffledIndex * this.getTileLongitudinalCoordinateMultiplier();
        return this.getPoint(longitudinalCoordinate, transverseCoordinate);
    }

    private getTileTransverseCoordinate(): number {
        return this.parameters.transverseContentOffset
           + this.maxScaledBoundingSize / 2.0;
    }

    private getTileLongitudinalCoordinateOffset(): number {
        return this.parameters.longitudinalContentOffset
            + this.maxScaledBoundingSize / 2.0;
    }

    private getTileLongitudinalCoordinateMultiplier(): number {
        return this.maxScaledBoundingSize + this.parameters.betweenTilesOffset;
    }

    private getPoint(longitudinalCoordinate: number, transverseCoordinate: number): Point {
        return this.parameters.directionType === TileLineDirectionType.FromLeftToRight
            ? new Point(longitudinalCoordinate, transverseCoordinate)
            : new Point(transverseCoordinate, longitudinalCoordinate);
    }

    public getSizeByDirection(): Size {
        return this.parameters.directionType === TileLineDirectionType.FromLeftToRight
            ? new Size(this.longitudinalSize, this.transverseSize)
            : new Size(this.transverseSize, this.longitudinalSize);
    }

    public destroy(options?: DestroyOptions): void {
        this.resizeController.removeEventListeners();
        if (this.backgroundContainer) {
            this.backgroundContainer.destroy();
        }
        super.destroy(options);
    }
}