import { Graphics, Matrix, Renderer, Texture } from "pixi.js";
import { TilingModel } from "./TilingModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TileModel } from "../tiles/TileModel.ts";
import { ModelSettings } from "../ModelSettings.ts";
import { TilePosition } from "../tiles/TilePosition.ts";
import { RectangularGridTilePosition } from "../tiles/RectangularGridTilePosition.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где фигуры размещаются в строках и столбцах
 */
export abstract class RectangularGridTilingModel extends TilingModel {

    //#region Texture tile info

    /**
     * Количество столбцов с элементами замощения
     */
    public tileColumnCount: number = 0;
    /**
     * Количество строк с элементами замощения
     */
    public tileRowCount: number = 0;

    //#endregion Texture tile info

    private renderer: Renderer;

    constructor(
        modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {
        super(modelSettings, textureModel, imageContainerModel);
        this.renderer = renderer;
    }

    /**
     * Получение признака того, что в заданной строке и столбце должна быть фигура
     * в случае собранной мозаики
     * @param rowIndex Индекс строки
     * @param columnIndex Индекс столбца
     * @returns Признак корректности индексов строки и столбца
     */
    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.tileRowCount
            && columnIndex >= 0
            && columnIndex < this.tileColumnCount;
    }

    public getTileModel(targetTilePosition: TilePosition): TileModel | undefined {
        const targetPosition = targetTilePosition as RectangularGridTilePosition;
        if (!targetPosition) {
            throw new Error('tilePosition is not instance of RectangularGridTilePosition');
        }
        if (!this.getGridIndicesAreCorrect(targetPosition.rowIndex, targetPosition.columnIndex)) {
            return undefined;
        }        
        return this.getProtectedTileModel(targetPosition);
    }

    /**
     * Получение модели фигуры по её целевому положению в замощении
     * @param targetTilePosition Проверенная на корректность целевая позиция фигуры в замощении
     */
    protected abstract getProtectedTileModel(targetTilePosition: TilePosition): TileModel;

    public getTileTexture(tileModel: TileModel): Texture {
        if (!this.tilingContainerModel) {
            throw new Error('tilingContainerModel is not initialized');
        }

        const sideToTextureSideRatio = this.imageContainerModel.sideToTextureSideRatio;

        const textureTileLocalPivotPointX = tileModel.geometry.pivotPoint.x
            / sideToTextureSideRatio;
        const textureTileLocalPivotPointY = tileModel.geometry.pivotPoint.y
            / sideToTextureSideRatio;

        const textureTileAbsolutePivotPointX = (tileModel.targetPositionPoint.x
            + this.tilingContainerModel.boundingRectangle.x)
            / sideToTextureSideRatio;
        const textureTileAbsolutePivotPointY = (tileModel.targetPositionPoint.y
            + this.tilingContainerModel.boundingRectangle.y)
            / sideToTextureSideRatio;
        
        const textureTileDefaultBoundingRectangleWidth
            = tileModel.geometry.defaultBoundingRectangleSize.width
            / sideToTextureSideRatio;
        const textureTileDefaultBoundingRectangleHeight
            = tileModel.geometry.defaultBoundingRectangleSize.height
            / sideToTextureSideRatio;

        const textureMatrix = new Matrix();
        textureMatrix.setTransform(
            0, 0,
            textureTileAbsolutePivotPointX, textureTileAbsolutePivotPointY,
            1, 1,
            -tileModel.targetRotationAngle,
            0, 0
        );
        const globalTile = new Graphics()
            .rect(
                -textureTileLocalPivotPointX,
                -textureTileLocalPivotPointY,
                textureTileDefaultBoundingRectangleWidth,
                textureTileDefaultBoundingRectangleHeight
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global",
                matrix: textureMatrix
            });

        const result = this.renderer.generateTexture({
            target: globalTile,
            resolution: 1,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });

        globalTile.destroy();
        return result;
    }
}