import { Point, Renderer } from "pixi.js";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { ModelSettings } from "../../ModelSettings.ts";
import { HexagonGeometry } from "../../tile-geometries/polygons/HexagonGeometry.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { RectangularGridTilingModel } from "../RectangularGridTilingModel.ts";
import { TilingType } from "../TilingType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { HexagonBaseGeometry } from "../../tile-geometries/polygon-bases/HexagonBaseGeometry.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются правильные шестиугольники.
 * Там, где индекс столбца - нечётный,
 * шестиугольник располагается ниже предыдущего (с чётным индексом) наполовину.
 * Таким образом, расположение фигур - сотовидное.
 */
export class HexagonTilingModel extends RectangularGridTilingModel {
    public readonly tilingType: TilingType = TilingType.Hexagon;

    /**
     * Количество пар элементов замощения, укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально.
     * Выбрано именно количество пар, то есть идущих последовательно фигурок,
     * а не количество фигурок, потому что при шахматном замощении в паре будет
     * как фигура с чётным индексом столбца на обычном уровне строки,
     * так и фигура с нечётным индексом столбца, расположенная ниже обычного уровня строки.
     * Так будет проще просчитать замощение.
     */
    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 1;

    //#region Texture tile info

    /**
     * Сторона шестиугольника в масштабе и координатах исходной текстуры
     */
    private textureTileSide: number = 0;

    //#endregion Texture tile info

    /**
     * Инструменты для геометрических построений правильного шестиугольника,
     * один экземпляр на все элементы мозаики
     */
    private tileGeometry?: HexagonGeometry;

    /**
     * Создание замощения правильными шестиугольниками
     * @param modelSettings Модель настроек
     * @param textureModel Модель текстуры
     * @param textureMinSideTilePairCount Количество пар элементов замощения,
     * укладывающихся в минимальную сторону текстуры, в ширину или в высоту,
     * в зависимости от того, что из них минимально
     * @param imageContainerModel Модель контейнера изображения
     * @param renderer Объект, ответственный за отображение
     */
    constructor(
        modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {
        super(modelSettings, textureModel, imageContainerModel, renderer);
        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount < HexagonTilingModel.textureMinSideMinTilePairCount
                ? HexagonTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    protected initializeTextureTileInfo(): void {
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (0.5 + 3 * this.textureMinSideTilePairCount);
            this.tileColumnCount = 2 * this.textureMinSideTilePairCount;
            this.tileRowCount = Math.trunc(this.textureModel.height
                / this.textureTileSide / HexagonBaseGeometry.inscribedCircleDiameterToSideRatio
                - 0.5);
        } else {
            this.textureTileSide = this.textureModel.minSide
                / HexagonBaseGeometry.inscribedCircleDiameterToSideRatio
                / (this.textureMinSideTilePairCount * 2 + 0.5);
            this.tileColumnCount = 2 * Math.trunc((this.textureModel.width
                / this.textureTileSide - 0.5) / 3.0);
            this.tileRowCount = 2 * this.textureMinSideTilePairCount;
        }

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * (0.5 + 3 / 2.0 * this.tileColumnCount)) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - HexagonBaseGeometry.inscribedCircleDiameterToSideRatio * this.textureTileSide
            * (this.tileRowCount + 0.5)) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileGeometry = new HexagonGeometry(tileSide);
        this.maxTileBoundingSize = this.tileGeometry.maxBoundingSize;
    }

    protected getProtectedTileModel(targetTilePosition: RectangularGridTilePosition): TileModel {
        if (!this.tileGeometry) {
            throw new Error('tileGeometry is not defined');
        }

        const result = new TileModel(this.modelSettings, this.tileGeometry);
        result.targetTilePosition = targetTilePosition.clone();
        result.targetRotationAngle = 0;
        const inscribedCircleRadius = this.tileGeometry.inscribedCircleRadius;
        result.targetPositionPoint = new Point(
            targetTilePosition.columnIndex * this.tileGeometry.side / 2.0 * 3
                + this.tileGeometry.side,
            targetTilePosition.rowIndex * this.tileGeometry.inscribedCircleRadius * 2.0
                + (targetTilePosition.columnIndex % 2 == 1 ? inscribedCircleRadius : 0)
                + inscribedCircleRadius
        );     
        return result;
    }
}