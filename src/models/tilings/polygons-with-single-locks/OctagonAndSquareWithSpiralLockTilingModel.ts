import { Point, Renderer } from "pixi.js";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { ModelSettings } from "../../ModelSettings.ts";
import { OctagonWithSingleLockGeometry }
    from "../../tile-geometries/polygons-with-single-locks/OctagonWithSingleLockGeometry.ts";
import { SquareWithSingleLockGeometry }
    from "../../tile-geometries/polygons-with-single-locks/SquareWithSingleLockGeometry.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { RectangularGridTilingModel } from "../RectangularGridTilingModel.ts";
import { TilingType } from "../TilingType.ts";
import { TilePosition } from "../../tiles/TilePosition.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { TileGeometry } from "../../tile-geometries/TileGeometry.ts";
import { OctagonBaseGeometry } from "../../tile-geometries/polygon-bases/OctagonBaseGeometry.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются правильные шестиугольники и квадраты
 * с одинарными замками.
 * Восьмиугольники расположены так, что их верхние и нижние стороны горизонтальны,
 * а левые и правые - вертикальны.
 * Квадраты находится между восьмиугольниками, они повёрнуты на 90 градусов
 * относительно своего обычного положения, то есть первая вершина смотрит вверх.
 * Будем считать, что в чётных строках расположены восьмиугольники,
 * а в нечётных - квадраты.
 * Края будут все заполнены состыкованными восьмиугольниками,
 * поэтому строк, содержащих квадраты, будет на одну строку меньше,
 * чем строк, содержащих восьмиугольники,
 * а также столбцов, содержащих квадраты, будет на один столбец меньше,
 * чем столбцов, содержащих восьмиугольники.
 * Если рассматривать только группу восьмиугольников,
 * то по виду расположения одинарных замков они расположены в шахматном порядке.
 * У одних выпуклые замки расположены на вертикальных и горизонтальных сторонах,
 * а замки-впадины - на диагональных сторонах.
 * У других выпуклые замки расположены на диагональных сторонах,
 * а замки-впадины - на вертикальных и горизонтальных сторонах.
 * Если рассматривать только группу квадратов,
 * то по виду расположения одинарных замков они расположены в шахматном порядке.
 * У одних выпуклые замки расположены на одной диагонали, а замки-впадины - на другой.
 * У других всё наоборот.
 */
export class OctagonAndSquareWithSpiralLockTilingModel extends RectangularGridTilingModel {
    public readonly tilingType: TilingType = TilingType.OctagonAndSquareWithSingleLock;
        public readonly lockType: TileLockType = TileLockType.Single;

    /**
     * Количество восьмиугольников, укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально.
     * Помним, что квадраты будут находиться между восьмиугольниками,
     * поэтому здесь они не учитываются.
     */
    public textureMinSideOctagonTileCount: number;
    public static readonly textureMinSideMinOctagonTileCount = 1;

    //#region Texture tile info

    /**
     * Сторона квадрата или восьмиугольника в масштабе и координатах исходной текстуры
     */
    private textureTileSide: number = 0;

    //#endregion Texture tile info

    /**
     * Инструменты для геометрических построений правильного восьмиугольника с одинарными замками,
     * один экземпляр на все восьмиугольники мозаики
     */
    private octagonTileGeometry?: OctagonWithSingleLockGeometry;
    /**
     * Инструменты для геометрических построений квадрата с одинарными замками,
     * один экземпляр на все квадраты мозаики
     */
    private squareTileGeometry?: SquareWithSingleLockGeometry;

    /**
     * Создание замощения правильными восьмиугольниками и квадратами с одинарными замками
     * @param modelSettings Модель настроек
     * @param textureModel Модель текстуры
     * @param textureMinSideOctagonTileCount Количество восьмиугольников,
     * укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально.
     * Помним, что квадраты будут находиться между восьмиугольниками,
     * поэтому здесь они не учитываются.
     * @param imageContainerModel Модель контейнера изображения
     * @param renderer Объект, ответственный за отображение
     */
    constructor(
        modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        textureMinSideOctagonTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {

        super(modelSettings, textureModel, imageContainerModel, renderer);
        this.textureMinSideOctagonTileCount
            = textureMinSideOctagonTileCount
                < OctagonAndSquareWithSpiralLockTilingModel.textureMinSideMinOctagonTileCount
                ? OctagonAndSquareWithSpiralLockTilingModel.textureMinSideMinOctagonTileCount
                : Math.floor(textureMinSideOctagonTileCount);
    }

    protected initializeTextureTileInfo(): void {
        const lockHeightToSideRatio = this.getLockHeightToSideRatio();
        this.textureTileSide = this.textureModel.minSide
            / (this.textureMinSideOctagonTileCount
            * OctagonBaseGeometry.inscribedCircleDiameterToSideRatio
            + 2 * lockHeightToSideRatio);
        const textureLockHeight = this.textureTileSide * lockHeightToSideRatio;

        if (this.textureModel.widthToHeightRatio <= 1) {
            this.tileColumnCount = this.textureMinSideOctagonTileCount;
            this.tileRowCount = 2 * Math.trunc(
                (this.textureModel.height - 2 * textureLockHeight)
                / this.textureTileSide
                / OctagonBaseGeometry.inscribedCircleDiameterToSideRatio) - 1;
        } else {
            this.tileColumnCount = Math.trunc(
                (this.textureModel.width - 2 * textureLockHeight)
                / this.textureTileSide / OctagonBaseGeometry.inscribedCircleDiameterToSideRatio);
            this.tileRowCount = 2 * this.textureMinSideOctagonTileCount - 1;
        }

        const textureOctagonTileInscribedCircleDiameter = this.textureTileSide
            * OctagonBaseGeometry.inscribedCircleDiameterToSideRatio;
        this.textureXTilingOffset = (this.textureModel.width
            - textureOctagonTileInscribedCircleDiameter * this.tileColumnCount
            - 2 * textureLockHeight) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - textureOctagonTileInscribedCircleDiameter * (this.tileRowCount / 2.0 + 0.5)
            - 2 * textureLockHeight) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonTileGeometry = new OctagonWithSingleLockGeometry(tileSide);
        this.squareTileGeometry = new SquareWithSingleLockGeometry(tileSide);
    }

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.tileRowCount
            && columnIndex >= 0
            && columnIndex < this.tileColumnCount - (rowIndex % 2);
    }

    protected getProtectedTileModel(targetTilePosition: TilePosition): TileModel {
        if (!this.octagonTileGeometry || !this.squareTileGeometry) {
            throw new Error('Tile geometry is not defined');
        }
            
        const targetPosition = targetTilePosition as RectangularGridTilePosition;
        const tileIsOctagon = targetPosition.rowIndex % 2 == 0;
        const tileGeometry: TileGeometry = tileIsOctagon
            ? this.octagonTileGeometry
            : this.squareTileGeometry;
        const result = new TileModel(this.modelSettings, tileGeometry);
        result.targetTilePosition = targetPosition.clone();

        const lockHeight = this.octagonTileGeometry.lockHeight;
        const octagonTileInscribedCircleRadius
            = this.octagonTileGeometry.inscribedCircleRadius;
        const octagonTileInscribedCircleDiameter = octagonTileInscribedCircleRadius * 2;
        if (tileIsOctagon) {
            result.targetRotationAngle
                = (targetPosition.rowIndex / 2 + targetPosition.columnIndex) % 2 == 0
                ? 0
                : Math.PI / 4;            
            result.targetPositionPoint = new Point(
                targetPosition.columnIndex * octagonTileInscribedCircleDiameter
                    + octagonTileInscribedCircleRadius + lockHeight,
                targetPosition.rowIndex / 2.0 * octagonTileInscribedCircleDiameter
                    + octagonTileInscribedCircleRadius + lockHeight
            );
        } else {
            result.targetRotationAngle
                = ((targetPosition.rowIndex - 1) / 2 + targetPosition.columnIndex) % 2 == 0
                ? 7.0 / 4.0 * Math.PI
                : Math.PI / 4;
            result.targetPositionPoint = new Point(
                (targetPosition.columnIndex + 1) * octagonTileInscribedCircleDiameter
                    + lockHeight,
                (targetPosition.rowIndex + 1) / 2.0 * octagonTileInscribedCircleDiameter
                    + lockHeight
            );
        }
        
        return result;
    }
}