import { Point, Renderer } from "pixi.js";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { HexagonWithSingleLockGeometry }
    from "../../tile-geometries/polygons-with-single-locks/HexagonWithSingleLockGeometry.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { RectangularGridTilingModel } from "../RectangularGridTilingModel.ts";
import { TilingType } from "../TilingType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { HexagonBaseGeometry } from "../../tile-geometries/polygon-bases/HexagonBaseGeometry.ts";
import { TileParameters } from "../../tiles/TileParameters.ts";
import { TileGeometryType } from "../../tile-geometries/TileGeometryType.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются правильные шестиугольники с одинарными замками.
 * Там, где индекс столбца - нечётный,
 * шестиугольник располагается ниже предыдущего (с чётным индексом) наполовину.
 * Таким образом, расположение фигур - сотовидное.
 * Каждый шестиугольник имеет выпуклый одинарный замок на верхней горизонтальной стороне
 * и замок-впадину на нижней горизонтальной стороне.
 * Таким образом высота каждого шестиугольника увеличена на высоту одинарного замка.
 * Выпуклые и вогнутые замки на диагональных сторонах не изменяют ширины фигуры.
 */
export class HexagonWithSingleLockTilingModel extends RectangularGridTilingModel {
    public readonly tilingType: TilingType = TilingType.HexagonWithSingleLock;
    public readonly lockType: TileLockType = TileLockType.Single;

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
     * Инструменты для геометрических построений правильного шестиугольника
     * с одинарными замками, один экземпляр на все элементы мозаики
     */
    private tileGeometry?: HexagonWithSingleLockGeometry;

    /**
     * Создание замощения правильными шестиугольниками с одинарными замками
     * @param tileParameters Параметры элемента замощения
     * @param textureModel Модель текстуры
     * @param textureMinSideTilePairCount Количество пар элементов замощения,
     * укладывающихся в минимальную сторону текстуры, в ширину или в высоту,
     * в зависимости от того, что из них минимально
     * @param imageContainerModel Модель контейнера изображения
     * @param renderer Объект, ответственный за отображение
     */
    constructor(
        tileParameters: TileParameters,
        textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {

        super(tileParameters, textureModel, imageContainerModel, renderer);
        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount
                < HexagonWithSingleLockTilingModel.textureMinSideMinTilePairCount
                ? HexagonWithSingleLockTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    protected initializeTextureTileInfo(): void {
        const lockHeightToSideRatio = this.getLockHeightToSideRatio();
        let textureLockHeight: number;
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (0.5 + 3 * this.textureMinSideTilePairCount);
            textureLockHeight = this.textureTileSide * lockHeightToSideRatio;
            this.tileColumnCount = 2 * this.textureMinSideTilePairCount;
            this.tileRowCount = Math.trunc((this.textureModel.height - textureLockHeight)
                / this.textureTileSide / HexagonBaseGeometry.inscribedCircleDiameterToSideRatio
                - 0.5);
        } else {
            this.textureTileSide = this.textureModel.minSide
                / HexagonBaseGeometry.inscribedCircleDiameterToSideRatio
                / (this.textureMinSideTilePairCount * 2 + 0.5 + lockHeightToSideRatio / 2);
            textureLockHeight = this.textureTileSide * lockHeightToSideRatio;
            this.tileColumnCount = 2 * Math.trunc((this.textureModel.width
                / this.textureTileSide - 0.5) / 3.0);
            this.tileRowCount = 2 * this.textureMinSideTilePairCount;
        }

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * (0.5 + 3 / 2.0 * this.tileColumnCount)) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height - textureLockHeight
            - HexagonBaseGeometry.inscribedCircleDiameterToSideRatio * this.textureTileSide
            * (this.tileRowCount + 0.5)) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileGeometry = new HexagonWithSingleLockGeometry(tileSide);
        this.maxTileBoundingSizesByTileGeometryTypes.set(TileGeometryType.HexagonWithSingleLock,
            this.tileGeometry.maxBoundingSize);
    }

    protected getProtectedTileModel(targetTilePosition: RectangularGridTilePosition): TileModel {
        if (!this.tileGeometry) {
            throw new Error('tileGeometry is not defined');
        }

        const result = new TileModel(this.tileParameters, this.tileGeometry);
        result.targetTilePosition = targetTilePosition.clone();
        result.targetRotationAngle = 0;
        const inscribedCircleRadius = this.tileGeometry.inscribedCircleRadius;
        result.targetPositionPoint = new Point(
            targetTilePosition.columnIndex * this.tileGeometry.side / 2.0 * 3
                + this.tileGeometry.side,
            targetTilePosition.rowIndex * this.tileGeometry.inscribedCircleRadius * 2
                + (targetTilePosition.columnIndex % 2 === 1 ? inscribedCircleRadius : 0)
                + this.tileGeometry.lockHeight
                + inscribedCircleRadius
        );     
        return result;
    }
}