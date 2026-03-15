import { Point, Renderer } from "pixi.js";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { RectangularGridTilingModel } from "../RectangularGridTilingModel.ts";
import { TilingType } from "../TilingType.ts";
import { SquareGeometry } from "../../tile-geometries/polygons/SquareGeometry.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { TileParameters } from "../../tiles/TileParameters.ts";
import { TileGeometryType } from "../../tile-geometries/TileGeometryType.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются квадраты
 */
export class SquareTilingModel extends RectangularGridTilingModel {
    public readonly tilingType: TilingType = TilingType.Square;

    /**
     * Количество элементов замощения, укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально
     */
    public textureMinSideTileCount: number;
    public static readonly textureMinSideMinTileCount = 2;

    //#region Texture tile info

    /**
     * Сторона квадрата в масштабе и координатах исходной текстуры
     */
    private textureTileSide: number = 0;

    //#endregion Texture tile info

    /**
     * Инструменты для геометрических построений квадрата, один экземпляр на все квадраты
     */
    private tileGeometry?: SquareGeometry;
    public tileZIndicesByTileGeometryTypes: Map<TileGeometryType, number>
        = new Map<TileGeometryType, number>([[TileGeometryType.Square, 0]]);

    /**
     * Создание замощения квадратами
     * @param tileParameters Параметры элемента замощения
     * @param textureModel Модель текстуры
     * @param textureMinSideTileCount Количество элементов замощения,
     * укладывающихся в минимальную сторону текстуры, в ширину или в высоту,
     * в зависимости от того, что из них минимально
     * @param imageContainerModel Модель контейнера изображения
     * @param renderer Объект, ответственный за отображение
     */
    constructor(
        tileParameters: TileParameters,
        textureModel: TilingTextureModel,
        textureMinSideTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {
        super(tileParameters, textureModel, imageContainerModel, renderer);
        this.textureMinSideTileCount
            = textureMinSideTileCount < SquareTilingModel.textureMinSideMinTileCount
                ? SquareTilingModel.textureMinSideMinTileCount
                : Math.floor(textureMinSideTileCount);
    }

    protected initializeTextureTileInfo(): void {
        this.textureTileSide = this.textureModel.minSide / this.textureMinSideTileCount;

        this.tileColumnCount = Math.trunc(this.textureModel.width / this.textureTileSide);
        this.tileRowCount = Math.trunc(this.textureModel.height / this.textureTileSide);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.tileColumnCount) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * this.tileRowCount) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileGeometry = new SquareGeometry(tileSide);
        this.maxTileBoundingSizesByTileGeometryTypes.set(TileGeometryType.Square,
            this.tileGeometry.maxBoundingSize);
    }

    protected getProtectedTileModel(targetTilePosition: RectangularGridTilePosition): TileModel {
        if (!this.tileGeometry) {
            throw new Error('tileGeometry is not defined');
        }

        const result = new TileModel(this.tileParameters, this.tileGeometry);
        result.targetTilePosition = targetTilePosition.clone();
        result.targetRotationAngle = 0;
        const sideHalf = this.tileGeometry.side / 2.0;
        result.targetPositionPoint = new Point(
           targetTilePosition.columnIndex * this.tileGeometry.side + sideHalf,
           targetTilePosition.rowIndex * this.tileGeometry.side + sideHalf
        );
        return result;
    }
}