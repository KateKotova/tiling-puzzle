import { Color, Container, Renderer } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { StaticTileView } from "../tile-decorators/StaticTileView.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { TileViewCreationParameters } from "../tiles/TileViewCreationParameters.ts";
import { TilingParameters } from "./TilingParameters.ts";

/**
 * Класс представления замощения
 */
export class TilingView {
    private readonly parameters: TilingParameters;
    public model: TilingModel;
    public tilingContainer: Container;
    public staticTilesContainer: Container;
    public draggableTilesContainer: Container;
    public staticTileFillColor: Color = new Color(0x00AA00);
    private staticTileAlpha: number = 1;
    /**
     * Карта, где по строковому представлению позиции
     * можно найти статический элемент замощения, представляющий собой
     * ячейку для размещения перетаскиваемой фигуры
     */
    public staticTileViewsByTilePositionStrings: Map<string, StaticTileView>
        = new Map<string, StaticTileView>();

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

    public createStaticTileViews(renderer: Renderer): void {
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
                    replacingTextureFillColor: this.staticTileFillColor
                };
                const tileView = tileViewFactory.getView(
                    this.parameters.tileParameters,
                    tileViewCreationParameters
                );
                tileView.content.alpha = this.staticTileAlpha;

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
    }
}