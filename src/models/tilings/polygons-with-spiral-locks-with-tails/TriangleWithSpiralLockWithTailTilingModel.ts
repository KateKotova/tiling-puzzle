import { TriangleWithSpiralLockWithTailGeometry }
    from "../../tile-geometries/polygons-with-spiral-locks-with-tails/TriangleWithSpiralLockWithTailGeometry.ts";
import { TileGeometryType } from "../../tile-geometries/TileGeometryType.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { RectangularGridTilingModel } from "../RectangularGridTilingModel.ts";
import { TilingType } from "../TilingType.ts";
import { TileParameters } from "../../tiles/TileParameters.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { Point, Renderer } from "pixi.js";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { TriangleGeometry } from "../../tile-geometries/polygons/TriangleGeometry.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются правильные треугольники
 * со спиральными замками с хвостиками.
 * Там, где сумма индексов строки и столбца - чётная,
 * треугольник перевёрнут относительно положения по умолчанию,
 * то есть вверху находится горизонтальная сторона.
 * Там, где сумма индексов строки и столбца - нечётная,
 * треугольник - в положении по умолчанию, первой вершиной вверх,
 * а внизу - горизонтальная сторона.
 * То есть расположение фигурок в повёрнутом на 180 градусов положении и в положении по умолчанию
 * происходит в шахматном порядке.
 */
export class TriangleWithSpiralLockWithTailTilingModel extends RectangularGridTilingModel {
    public readonly tilingType: TilingType = TilingType.TriangleWithSpiralLockWithTail;
    public readonly lockType: TileLockType = TileLockType.SpiralWithTail;

    /**
     * Количество пар элементов замощения, укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально.
     * Выбрано именно количество пар, то есть идущих последовательно фигурок,
     * а не количество фигурок, потому что при шахматном замощении в паре будет
     * как фигура повёрнутая, так и в положении по умолчанию.
     * Так будет проще просчитать замощение.
     */
    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 1;

    //#region Texture tile info

    /**
     * Сторона треугольника в масштабе и координатах исходной текстуры
     */
    private textureTileSide: number = 0;

    //#endregion Texture tile info

    /**
     * Инструменты для геометрических построений правильного треугольника
     * со спиральными замками с хвостиками, один экземпляр на все элементы мозаики
     */
    private tileGeometry?: TriangleWithSpiralLockWithTailGeometry;
    public tileZIndicesByTileGeometryTypes: Map<TileGeometryType, number>
        = new Map<TileGeometryType, number>(
            [[TileGeometryType.TriangleWithSpiralLockWithTail, 0]]
        );
        
    /**
     * Создание замощения правильными треугольниками со спиральными замками с хвостиками
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
            < TriangleWithSpiralLockWithTailTilingModel.textureMinSideMinTilePairCount
                ? TriangleWithSpiralLockWithTailTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    protected initializeTextureTileInfo(): void {
        let textureTileHeight: number;
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (this.textureMinSideTilePairCount + 0.5
                + TriangleWithSpiralLockWithTailGeometry
                .defaultHorizontalMaxLockHeightToSideRatio * 2);
            textureTileHeight = TriangleGeometry.heightToSideRatio * this.textureTileSide;
        } else {
            textureTileHeight = this.textureModel.minSide
                / (this.textureMinSideTilePairCount
                + TriangleWithSpiralLockWithTailGeometry
                .defaultVerticalMaxLockHeightToSideRatio) / 2;
            this.textureTileSide = textureTileHeight / TriangleGeometry.heightToSideRatio;
        }

        const textureHorizontalMaxLockHeight = this.textureTileSide
            * TriangleWithSpiralLockWithTailGeometry.defaultHorizontalMaxLockHeightToSideRatio;
        const textureVerticalMaxLockHeight = this.textureTileSide
            * TriangleWithSpiralLockWithTailGeometry.defaultVerticalMaxLockHeightToSideRatio;

        this.tileColumnCount = 2 * Math.trunc(
            (this.textureModel.width - this.textureTileSide / 2.0) / this.textureTileSide);
        this.tileRowCount = Math.trunc((this.textureModel.height) / textureTileHeight);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide / 2.0 * (this.tileColumnCount + 1)
            - textureHorizontalMaxLockHeight * 2) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - textureTileHeight * this.tileRowCount
            - textureVerticalMaxLockHeight * 2) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileGeometry = new TriangleWithSpiralLockWithTailGeometry(tileSide);
        this.maxTileBoundingSizesByTileGeometryTypes.set(
            TileGeometryType.TriangleWithSpiralLockWithTail,
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
        result.targetRotationAngle = tileIsRotated ? Math.PI : 0;

        const sideHalf = this.tileGeometry.side / 2.0;
        result.targetPositionPoint = new Point(
            (targetTilePosition.columnIndex + 1) * sideHalf
                + this.tileGeometry.defaultHorizontalMaxLockHeight,
            targetTilePosition.rowIndex * this.tileGeometry.height
                + this.tileGeometry.defaultVerticalMaxLockHeight
                + (tileIsRotated
                    ? this.tileGeometry.inscribedCircleRadius
                    : this.tileGeometry.circumscribedCircleRadius)
        );
        
        return result;
    }
}