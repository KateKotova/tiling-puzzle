import { Container, Renderer, Ticker } from "pixi.js";
import { RectangularGridTilingModel } from "../../models/tilings/RectangularGridTilingModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { TilingView } from "./TilingView.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { RectangularGridTilePosition } from "../../models/tiles/RectangularGridTilePosition.ts";
import { StaticTileView } from "../tile-decorators/StaticTileView.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { ZoomAndPanContainer } from "../components/ZoomAndPanContainer.ts";
import { TileViewCreationParameters } from "../tiles/TileViewCreationParameters.ts";

/**
 * Класс представления замощения, представляющего собой прямоугольную сетку,
 * где фигуры размещаются в строках и столбцах
 */
export class RectangularGridTilingView extends TilingView {
    constructor(
        viewSettings: ViewSettings,
        viewport: ZoomAndPanContainer,
        selectedTileContainer: Container,
        model: TilingModel
    ) {
        if (!(model instanceof RectangularGridTilingModel)) {
            throw new Error("The tiling model is not an instance of RectangularGridTilingModel");
        }
        super(viewSettings, viewport, selectedTileContainer, model);
    }

    public setExampleTiling(renderer: Renderer, ticker: Ticker): void {
        const model = this.model as RectangularGridTilingModel;
        const tileViewFactory = new TileViewFactory();
        
        for (let rowIndex = 0; rowIndex < model.tileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.tileColumnCount; columnIndex++) {
                if (!model.getGridIndicesAreCorrect(rowIndex, columnIndex)) {
                    continue;
                }

                const tilePosition = new RectangularGridTilePosition(rowIndex, columnIndex);

                const staticTileModel = model.getTileModel(tilePosition);
                if (!staticTileModel) {
                    continue;
                }
                staticTileModel.currentRotationAngle = staticTileModel.targetRotationAngle;
                staticTileModel.currentTargetRotationAngle = staticTileModel.targetRotationAngle;
                staticTileModel.currentPositionPoint.copyFrom(staticTileModel.targetPositionPoint);

                const staticTileCreationViewParameters: TileViewCreationParameters = {
                    model: staticTileModel,
                    texture: undefined,
                    renderer,
                    replacingTextureFillColor: this.staticTileFillColor
                };
                const staticTileView = tileViewFactory.getView(
                    this.viewSettings.tileParameters,
                    staticTileCreationViewParameters
                );
                //staticTileView.content.alpha = 0.7;
                this.staticTilesContainer.addChild(staticTileView.tile);
                const decoratedStaticTileView = new StaticTileView(
                    this.viewSettings.staticTileParameters,
                    staticTileView,
                    this.draggingTileData
                );

                const shouldCreateDraggableTile = Math.random() >= 0.5;
                if (shouldCreateDraggableTile) {
                    const draggableTileModel = staticTileModel.clone();
                    const currentRotationAngle = draggableTileModel.targetRotationAngle
                        + draggableTileModel.geometry.freedomDegreeRotationAngle;
                    draggableTileModel.currentRotationAngle = currentRotationAngle;
                    draggableTileModel.currentTargetRotationAngle = currentRotationAngle;
                    draggableTileModel.currentPositionPoint
                        = draggableTileModel.targetPositionPoint.clone();
                    const draggableTileViewCreationParameters: TileViewCreationParameters = {
                        model: draggableTileModel,
                        texture: model.getTileTexture(draggableTileModel),
                        renderer,
                        replacingTextureFillColor: this.staticTileFillColor
                    };
                    const draggableTileView = tileViewFactory.getView(
                        this.viewSettings.tileParameters,
                        draggableTileViewCreationParameters
                    );
                    this.draggableTilesContainer.addChild(draggableTileView.tile);
                    const decoratedDraggableTileView = new DraggableTileView(
                        this.viewSettings.draggableTileParameters,
                        draggableTileView,
                        this.selectedTileContainer,
                        ticker,
                        this.draggingTileData);
                    decoratedDraggableTileView.setInitialDragSource(decoratedStaticTileView);
                }
            }
        }
    }
}