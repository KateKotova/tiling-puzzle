import { Color, Container, Renderer, Ticker } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { StaticTileView } from "../tile-decorators/StaticTileView.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { TileViewCreationParameters } from "../tiles/TileViewCreationParameters.ts";
import { TilingParameters } from "./TilingParameters.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { TilesAlphaController } from "../controllers/TilesAlphaController.ts";
import { TileGeometryType } from "../../models/tile-geometries/TileGeometryType.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";

/**
 * Класс представления замощения
 */
export class TilingView {
    public readonly parameters: TilingParameters;
    public model: TilingModel;
    public tilingContainer: Container;
    public staticTilesContainer: Container;
    public draggableTilesContainer: Container;
    /**
     * Цвет заливки статических элементов замощения по умолчанию
     */
    public defaultStaticTileFillColor: Color = new Color(0x008F00);
    /**
     * Цвет заливки статических элементов, который устанавливается
     * для фигур того же типа геометрии, что и выбранный перетаскиваемый элемент замощения
     */
    public targetStaticTileFillColor: Color = new Color(0x00AF00);
    /**
     * Карта, где по строковому представлению позиции
     * можно найти статический элемент замощения, представляющий собой
     * ячейку для размещения перетаскиваемой фигуры
     */
    public staticTileViewsByTilePositionStrings: Map<string, StaticTileView>
        = new Map<string, StaticTileView>();
    /**
     * Карта, где по строковому представлению позиции
     * можно найти перетаскиваемый элемент замощения
     */
    public draggableTileViewsByTilePositionStrings: Map<string, DraggableTileView>
        = new Map<string, DraggableTileView>();

    public staticTilesAlphaController?: TilesAlphaController;

    private boundOnDraggingTileIsSelected: (event: CustomEvent<DraggableTileView>) => void
        = this.onDraggingTileIsSelected.bind(this);
    private boundOnDraggingTileIsDeselected: (event: CustomEvent<DraggableTileView>) => void
        = this.onDraggingTileIsDeselected.bind(this);

    constructor(
        parameters: TilingParameters,
        model: TilingModel
    ) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }

        this.parameters = parameters;
        this.model = model;
        this.tilingContainer = this.createTilingContainer();

        this.staticTilesContainer = new Container();
        this.tilingContainer.addChild(this.staticTilesContainer);

        this.draggableTilesContainer = new Container();
        this.tilingContainer.addChild(this.draggableTilesContainer);

        window.addEventListener(DraggableTileView.draggingTileIsSelectedEventName,
            this.boundOnDraggingTileIsSelected as EventListener);        
    }

    private createTilingContainer(): Container {
        const rectangle = this.model.tilingContainerModel!.boundingRectangle;
        return new Container({
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        });
    }

    public createStaticTileViews(renderer: Renderer, ticker: Ticker): void {
        const tileViewFactory = new TileViewFactory();

        for (
            let edgeDistanceIndex = 0;
            edgeDistanceIndex < this.model.tilePositionsByEdgeDistanceIndices.length;
            edgeDistanceIndex++
        ) {
            const tilePositions = this.model
                .tilePositionsByEdgeDistanceIndices[edgeDistanceIndex];
            for (
                let tilePositionIndex = 0;
                tilePositionIndex < tilePositions.length;
                tilePositionIndex++
            ) {
                const tilePosition = tilePositions[tilePositionIndex];
                
                const tileModel = this.model.getTileModel(tilePosition);
                if (!tileModel) {
                    continue;
                }
                tileModel.currentRotationAngle = tileModel.targetRotationAngle;
                tileModel.currentTargetRotationAngle = tileModel.targetRotationAngle;
                tileModel.currentPositionPoint.copyFrom(tileModel.targetPositionPoint);

                const tileViewCreationParameters: TileViewCreationParameters = {
                    model: tileModel,
                    texture: undefined,
                    renderer,
                    replacingTextureFillColor: this.defaultStaticTileFillColor
                };
                const tileView = tileViewFactory.getView(
                    this.parameters.tileParameters,
                    tileViewCreationParameters
                );
                tileView.content.alpha = this.parameters.staticTileParameters.defaultAlpha;

                this.staticTilesContainer.addChild(tileView.tile);

                const decoratedTileView = new StaticTileView(
                    this.parameters.staticTileParameters,
                    tileView
                );
                this.staticTileViewsByTilePositionStrings.set(
                    tilePosition.toString(),
                    decoratedTileView
                );
            }
        }

        this.staticTilesAlphaController = new TilesAlphaController(
            this.parameters.animationParameters,
            [...this.staticTileViewsByTilePositionStrings.values()],
            ticker
        );
    }

    public setHintAlphaForStaticTiles(): void {
        this.staticTilesAlphaController?.restart(
            this.parameters.staticTileParameters.defaultAlpha,
            this.parameters.staticTileParameters.hintAlpha
        );
    }

    public setDefaultAlphaForStaticTiles(): void {
        this.staticTilesAlphaController?.restart(
            this.parameters.staticTileParameters.hintAlpha,
            this.parameters.staticTileParameters.defaultAlpha
        );
    }

    private setStaticTileFillColor(
        geometryType: TileGeometryType,
        fillColor: Color
    ): void {
        const tileViews = [...this.staticTileViewsByTilePositionStrings.values()]
            .filter(tileView => tileView.view.model.geometry.geometryType === geometryType);

        tileViews.forEach(tileView => {
            tileView.view.replacingTextureFillColor = fillColor;
            const newContent = tileView.createContent(true);
            tileView.view.replaceContent(newContent);
        });
    }

    private onDraggingTileIsSelected(event: CustomEvent<DraggableTileView>): void {
        // Делаем небольшую паузу на тап, чтобы не было моргания при тапе на фигуре,
        // потому что тап предполагает только поворот, а не длительное перетаскивание
        setTimeout(() => {
                if (draggingTileData.view) {
                    const geometryType = event.detail.model.geometry.geometryType;
                    this.setStaticTileFillColor(geometryType, this.targetStaticTileFillColor);

                    window.addEventListener(DraggableTileView.draggingTileIsDeselectedEventName,
                        this.boundOnDraggingTileIsDeselected as EventListener);
                }
            }, 
            this.parameters.tapParameters.maxDuration
        );
    }

    private onDraggingTileIsDeselected(event: CustomEvent<DraggableTileView>): void {
        window.removeEventListener(DraggableTileView.draggingTileIsDeselectedEventName,
            this.boundOnDraggingTileIsDeselected as EventListener);

        const geometryType = event.detail.model.geometry.geometryType;
        this.setStaticTileFillColor(geometryType, this.defaultStaticTileFillColor);
    }

    public destroy(): void {
        window.removeEventListener(DraggableTileView.draggingTileIsSelectedEventName,
            this.boundOnDraggingTileIsSelected as EventListener);
        window.removeEventListener(DraggableTileView.draggingTileIsDeselectedEventName,
            this.boundOnDraggingTileIsDeselected as EventListener);

        this.staticTilesAlphaController?.destroy();

        draggingTileData.view = undefined;
        draggingTileData.animatingViews.clear();

        for (const tileView of this.draggableTileViewsByTilePositionStrings.values()) {
            tileView.view.tile.parent?.removeChild(tileView.view.tile);
            tileView.destroy();
        }
        this.draggableTileViewsByTilePositionStrings.clear();

        for (const tileView of this.staticTileViewsByTilePositionStrings.values()) {
            tileView.view.tile.parent?.removeChild(tileView.view.tile);
            tileView.destroy();
        }
        this.staticTileViewsByTilePositionStrings.clear();

        this.staticTilesContainer.destroy();
        this.draggableTilesContainer.destroy();
        this.tilingContainer.destroy();
    }
}