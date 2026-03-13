import { Point, Renderer } from "pixi.js";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { SquareWithSingleLockGeometry }
    from "../../tile-geometries/polygons-with-single-locks/SquareWithSingleLockGeometry.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { RectangularGridTilingModel } from "../RectangularGridTilingModel.ts";
import { TilingType } from "../TilingType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { TileParameters } from "../../tiles/TileParameters.ts";
import { TileGeometryType } from "../../tile-geometries/TileGeometryType.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются квадраты с одинарными замками.
 * Там, где сумма индексов строки и столбца - чётная,
 * выпуклые замки располагаются вертикально, а вогнутые - горизонтально.
 * Там, где сумма индексов строки и столбца - нечётная,
 * выпуклые замки располагаются горизонтально, а вогнутые - вертикально.
 * То есть расположение фигурок в положении по умолчанию и в повёрнутом на 90 градусов положении
 * происходит в шахматном порядке.
 */
export class SquareWithSingleLockTilingModel extends RectangularGridTilingModel {
    public readonly tilingType: TilingType = TilingType.SquareWithSingleLock;
    public readonly lockType: TileLockType = TileLockType.Single;

    /**
     * Количество пар элементов замощения, укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально.
     * Выбрано именно количество пар, то есть идущих последовательно фигурок,
     * а не количество фигурок, потому что при шахматном замощении в паре будет
     * как фигура в положении по умолчанию, так и повёрнутая,
     * то есть выпуклые замки появятся как по горизонтали, так и по вертикали.
     * Так будет проще просчитать замощение.
     */
    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 1;

    //#region Texture tile info

    /**
     * Сторона квадрата в масштабе и координатах исходной текстуры
     */
    private textureTileSide: number = 0;

    //#endregion Texture tile info

    /**
     * Инструменты для геометрических построений квадрата с одинарными замками,
     * один экземпляр на все элементы мозаики
     */
    private tileGeometry?: SquareWithSingleLockGeometry;

    /**
     * Создание замощения квадратами c одинарными замками
     * @param tileParameters Параметры элементов замощения
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
            < SquareWithSingleLockTilingModel.textureMinSideMinTilePairCount
                ? SquareWithSingleLockTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    protected initializeTextureTileInfo(): void {
        const lockHeightToSideRatio = this.getLockHeightToSideRatio();
        this.textureTileSide = this.textureModel.minSide
            / (this.textureMinSideTilePairCount + lockHeightToSideRatio) / 2;
        const textureLockHeight = this.textureTileSide * lockHeightToSideRatio;

        this.tileColumnCount = Math.trunc(
            (this.textureModel.width - textureLockHeight * 2) / this.textureTileSide);
        this.tileRowCount = Math.trunc(
            (this.textureModel.height - textureLockHeight * 2) / this.textureTileSide);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.tileColumnCount - 2 * textureLockHeight) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * this.tileRowCount - 2 * textureLockHeight) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileGeometry = new SquareWithSingleLockGeometry(tileSide);
        this.maxTileBoundingSizesByTileGeometryTypes.set(TileGeometryType.SquareWithSingleLock,
            this.tileGeometry.maxBoundingSize);
    }

    protected getProtectedTileModel(targetTilePosition: RectangularGridTilePosition): TileModel {
        if (!this.tileGeometry) {
            throw new Error('tileGeometry is not defined');
        }
            
        const result = new TileModel(this.tileParameters, this.tileGeometry);
        result.targetTilePosition = targetTilePosition.clone();

        const tileIsRotated = (targetTilePosition.rowIndex + targetTilePosition.columnIndex)
            % 2 === 1;
        result.targetRotationAngle = tileIsRotated ? Math.PI / 2 : 0;

        const sideHalf = this.tileGeometry.side / 2.0;
        result.targetPositionPoint = new Point(
            targetTilePosition.columnIndex * this.tileGeometry.side + sideHalf
                + this.tileGeometry.lockHeight,
            targetTilePosition.rowIndex * this.tileGeometry.side + sideHalf
                + this.tileGeometry.lockHeight
        );

        return result;
    }
}