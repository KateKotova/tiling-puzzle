import { Color, Container, ContainerChild, ContainerOptions, DestroyOptions, Graphics, Point, Rectangle, Renderer, Ticker } from "pixi.js";
import { TileLineParameters } from "./TileLineParameters.ts";
import { TilingView } from "../tilings/TilingView.ts";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";
import { TilePosition } from "../../models/tiles/TilePosition.ts";
import { TileViewCreationParameters } from "../tiles/TileViewCreationParameters.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { DraggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { Size } from "../../math/Size.ts";
import { TileLineLayoutType } from "./TileLineLayoutType.ts";
import { AdditionalMath } from "../../math/AdditionalMath.ts";

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
    private readonly longitudinalSize: number;
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
    private tileScaleChangeGlobalRectangle?: Rectangle;
    /**
     * Максимальный предельный размер масштабированного элемента мозаики.
     */
    private readonly maxScaledTileBoundingSize: number;

    private selectedTileContainer: Container;
    /**
     * Информация о фигуре, которая перетаскивается в данный момент.
     * Этот объект один на всех.
     */
    private draggingTileData: DraggingTileData;

    private backgroundContainer: Container;
    public backgroundFillColor: Color = new Color(0x00AA00);

    constructor(
        parameters: TileLineParameters,
        transverseSize: number,
        tilingView: TilingView,
        selectedTileContainer: Container,
        draggingTileData: DraggingTileData,
        options?: ContainerOptions<ContainerChild>        
    ) {
        super(options);
        this.parameters = parameters;
        this.transverseSize = transverseSize;
        this.tilingView = tilingView;
        this.selectedTileContainer = selectedTileContainer;
        this.draggingTileData = draggingTileData;        

        this.maxScaledTileBoundingSize = this.transverseSize
            - 2 * this.parameters.transverseContentOffset;

        const tileCount = this.tilingView.model.shuffledTilePositions.length;
        this.longitudinalSize = 2 * this.parameters.longitudinalContentOffset
            + tileCount * this.maxScaledTileBoundingSize
            + (tileCount - 1) * this.parameters.betweenTilesOffset;

        const size = this.getSizeByDirection();
        this.width = size.width;
        this.height = size.height;
        
        this.initialTileScale = this.maxScaledTileBoundingSize
            / this.tilingView.model.maxTileBoundingSize;

        this.tileScaleChangeGlobalRectangle = this.getTileScaleChangeGlobalRectangle();

        this.backgroundContainer = this.createBackground();
        this.addChild(this.backgroundContainer);
    }

    /**
     * Метод, который нужно вызывать после добавления данного контейнера к родителю.
     * Устанавливает зону изменения масштабирования
     */
    public onAddedToParent(): void {
        this.tileScaleChangeGlobalRectangle = this.getTileScaleChangeGlobalRectangle();
    }

    private getTileScaleChangeGlobalRectangle(): Rectangle {
        const globalLeftTop = this.toGlobal(new Point(0, 0));
        const widthHalf = this.width / 2.0;
        const heightHalf = this.height / 2.0;
        switch (this.parameters.layoutType) {
            case TileLineLayoutType.Top:
                return new Rectangle(
                    globalLeftTop.x,
                    globalLeftTop.y + heightHalf,
                    this.width,
                    heightHalf
                );
            case TileLineLayoutType.Left:
                return new Rectangle(
                    globalLeftTop.x + widthHalf,
                    globalLeftTop.y,
                    widthHalf,
                    this.height
                );
            case TileLineLayoutType.Bottom:
                return new Rectangle(
                    globalLeftTop.x,
                    globalLeftTop.y,
                    this.width,
                    heightHalf
                );
            case TileLineLayoutType.Right:
                return new Rectangle(
                    globalLeftTop.x,
                    globalLeftTop.y,
                    widthHalf,
                    this.height
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
        const staticTileViewsWereCreated = !!this.tilingView.staticTileViewsByTilePositionStrings
            .size;
        if (!staticTileViewsWereCreated) {
            throw new Error('static tiles were not created');
        }
        if (!this.tilingView.model.shuffledTilePositions) {
            throw new Error('shuffledTilePositions were not filled');
        }

        const tileViewFactory = new TileViewFactory();
        const transverseCoordinate = this.getTileTransverseCoordinate();
        const longitudinalCoordinateOffset = this.getTileLongitudinalCoordinateOffset();
        const longitudinalCoordinateMultiplier = this.getTileLongitudinalCoordinateMultiplier();
        
        for (
            let tilePositionIndex = 0;
            tilePositionIndex < this.tilingView.model.shuffledTilePositions.length;
            tilePositionIndex++
        ) {
            const tilePosition = this.tilingView.model.shuffledTilePositions[tilePositionIndex];
            const staticTileView = this.tilingView.staticTileViewsByTilePositionStrings.get(
                tilePosition.toString());
            if (!staticTileView) {
                continue;
            }

            const tileModel = staticTileView.model.clone();
            const currentRotationAngle = Math.random() * 2 * Math.PI;
            tileModel.currentRotationAngle = currentRotationAngle;
            tileModel.currentTargetRotationAngle = currentRotationAngle;
            tileModel.targetTilePosition.shuffledIndex = tilePositionIndex;

            const longitudinalCoordinate = longitudinalCoordinateOffset
                + tilePosition.shuffledIndex * longitudinalCoordinateMultiplier;
            tileModel.currentPositionPoint = this.getPoint(longitudinalCoordinate,
                transverseCoordinate);

            const tileViewCreationParameters: TileViewCreationParameters = {
                model: tileModel,
                texture: this.tilingView.model.getTileTexture(tileModel),
                renderer,
                replacingTextureFillColor: this.tilingView.staticTileFillColor
            };
            const tileView = tileViewFactory.getView(
                this.parameters.tileParameters,
                tileViewCreationParameters
            );
            tileView.tile.scale = this.initialTileScale;

            this.addChild(tileView.tile);

            new DraggableTileView(
                this.parameters.draggableTileParameters,
                tileView,
                this,
                this.tilingView.draggableTilesContainer,
                this.selectedTileContainer,
                ticker,
                this.draggingTileData
            );
        }
    }

    public setScaleRelativeToScaleChangeGlobalRectangle(
        globalPoint: Point,
        tileView: DraggableTileView
    ): void {
        if (!this.tileScaleChangeGlobalRectangle) {
            throw new Error('tileScaleChangeGlobalRectangle was not created');
        }

        const shouldChangeScale = AdditionalMath.getPointIsInsideRectangle(
            globalPoint,
            this.tileScaleChangeGlobalRectangle
        );
        if (!shouldChangeScale) {
            return;
        }
        
        const tilingViewportScale = this.draggingTileData.viewport.scale.x;
        const scaleDifference = tilingViewportScale - this.initialTileScale;
        const coordinateDifference = this.parameters.layoutType == TileLineLayoutType.Top
            || this.parameters.layoutType == TileLineLayoutType.Bottom
            ? this.tileScaleChangeGlobalRectangle.height
            : this.tileScaleChangeGlobalRectangle.width;
        const scaleToCoordinateRatio = scaleDifference / coordinateDifference;

        let coordinateDistance: number;
        switch (this.parameters.layoutType) {
            case TileLineLayoutType.Top:
                coordinateDistance = globalPoint.y - this.tileScaleChangeGlobalRectangle.y;
                break;
            case TileLineLayoutType.Bottom:
                coordinateDistance = this.tileScaleChangeGlobalRectangle.y
                    + this.tileScaleChangeGlobalRectangle.height
                    - globalPoint.y;
                break;
            case TileLineLayoutType.Left:
                coordinateDistance = globalPoint.x - this.tileScaleChangeGlobalRectangle.x;
                break;            
            case TileLineLayoutType.Right:
                coordinateDistance = this.tileScaleChangeGlobalRectangle.x
                    + this.tileScaleChangeGlobalRectangle.width
                    - globalPoint.x;
                break;
            default:
                coordinateDistance = 0;
                break;
        }
        
        tileView.view.tile.scale = this.initialTileScale
            + scaleToCoordinateRatio * coordinateDistance;
    }

    public getTilePositionPoint(tilePosition: TilePosition): Point {
        const transverseCoordinate = this.getTileTransverseCoordinate();
        const longitudinalCoordinate = this.getTileLongitudinalCoordinateOffset()
            + tilePosition.shuffledIndex * this.getTileLongitudinalCoordinateMultiplier();
        return this.getPoint(longitudinalCoordinate, transverseCoordinate);
    }

    private getTileTransverseCoordinate(): number {
        return this.parameters.transverseContentOffset
           + this.maxScaledTileBoundingSize / 2.0;
    }

    private getTileLongitudinalCoordinateOffset(): number {
        return this.parameters.longitudinalContentOffset
            + this.maxScaledTileBoundingSize / 2.0;
    }

    private getTileLongitudinalCoordinateMultiplier(): number {
        return this.maxScaledTileBoundingSize + this.parameters.betweenTilesOffset;
    }

    private getPoint(longitudinalCoordinate: number, transverseCoordinate: number): Point {
        return this.parameters.directionType == TileLineDirectionType.FromLeftToRight
            ? new Point(longitudinalCoordinate, transverseCoordinate)
            : new Point(transverseCoordinate, longitudinalCoordinate);
    }

    public getSizeByDirection(): Size {
        return this.parameters.directionType == TileLineDirectionType.FromLeftToRight
            ? new Size(this.longitudinalSize, this.transverseSize)
            : new Size(this.transverseSize, this.longitudinalSize);
    }

    public destroy(options?: DestroyOptions): void {
        if (this.backgroundContainer) {
            this.backgroundContainer.destroy();
        }
        super.destroy(options);
    }
}