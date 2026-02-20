import { Point, Renderer } from "pixi.js";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { ModelSettings } from "../../ModelSettings.ts";
import { OctagonGeometry } from "../../tile-geometries/polygons/OctagonGeometry.ts";
import { SquareGeometry } from "../../tile-geometries/polygons/SquareGeometry.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { TilingType } from "../TilingType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { TileGeometry } from "../../tile-geometries/TileGeometry.ts";
import { OctagonBaseGeometry } from "../../tile-geometries/polygon-bases/OctagonBaseGeometry.ts";
import { OctagonAndSquareTilingBaseModel } from "../OctagonAndSquareTilingBaseModel.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются правильные восьмиугольники и квадраты.
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
 */
export class OctagonAndSquareTilingModel extends OctagonAndSquareTilingBaseModel {
    public readonly tilingType: TilingType = TilingType.OctagonAndSquare;

    /**
     * Количество восьмиугольников, укладывающихся в минимальную сторону текстуры,
     * в ширину или в высоту, в зависимости от того, что из них минимально.
     * Помним, что квадраты будут находиться между восьмиугольниками,
     * поэтому здесь они не учитываются.
     */
    public textureMinSideOctagonTileCount: number;
    public static readonly textureMinSideMinOctagonTileCount = 2;

    //#region Texture tile info

    /**
     * Сторона квадрата или восьмиугольника в масштабе и координатах исходной текстуры
     */
    private textureTileSide: number = 0;

    //#endregion Texture tile info

    /**
     * Инструменты для геометрических построений правильного восьмиугольника,
     * один экземпляр на все восьмиугольники мозаики
     */
    private octagonTileGeometry?: OctagonGeometry;
    /**
     * Инструменты для геометрических построений квадрата,
     * один экземпляр на все квадраты мозаики
     */
    private squareTileGeometry?: SquareGeometry;

    /**
     * Создание замощения правильными восьмиугольниками и квадратами
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
                < OctagonAndSquareTilingModel.textureMinSideMinOctagonTileCount
                ? OctagonAndSquareTilingModel.textureMinSideMinOctagonTileCount
                : Math.floor(textureMinSideOctagonTileCount);
    }

    protected initializeTextureTileInfo(): void {
        this.textureTileSide = this.textureModel.minSide / this.textureMinSideOctagonTileCount
            / OctagonBaseGeometry.inscribedCircleDiameterToSideRatio;
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.tileColumnCount = this.textureMinSideOctagonTileCount;
            this.tileRowCount = 2 * Math.trunc(this.textureModel.height / this.textureTileSide
                / OctagonBaseGeometry.inscribedCircleDiameterToSideRatio) - 1;
        } else {
            this.tileColumnCount = Math.trunc(
                this.textureModel.width / this.textureTileSide
                / OctagonBaseGeometry.inscribedCircleDiameterToSideRatio);
            this.tileRowCount = 2 * this.textureMinSideOctagonTileCount - 1;
        }

        const textureOctagonTileInscribedCircleDiameter = this.textureTileSide
            * OctagonBaseGeometry.inscribedCircleDiameterToSideRatio;
        this.textureXTilingOffset = (this.textureModel.width
            - textureOctagonTileInscribedCircleDiameter * this.tileColumnCount) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - textureOctagonTileInscribedCircleDiameter * (this.tileRowCount / 2.0 + 0.5)) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        const tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonTileGeometry = new OctagonGeometry(tileSide);
        this.squareTileGeometry = new SquareGeometry(tileSide);
        this.maxTileBoundingSize = Math.max(
            this.octagonTileGeometry.maxBoundingSize,
            this.squareTileGeometry.maxBoundingSize
        );
    }

    protected getProtectedTileModel(targetTilePosition: RectangularGridTilePosition): TileModel {
        if (!this.octagonTileGeometry || !this.squareTileGeometry) {
            throw new Error('Tile geometry is not defined');
        }

        const tileIsOctagon = targetTilePosition.rowIndex % 2 == 0;
        const tileGeometry: TileGeometry = tileIsOctagon
            ? this.octagonTileGeometry
            : this.squareTileGeometry;
        const result = new TileModel(this.modelSettings, tileGeometry);
        result.targetTilePosition = targetTilePosition.clone();
        result.targetRotationAngle = tileIsOctagon ? 0 : Math.PI / 4.0;
        
        const octagonTileInscribedCircleRadius
            = this.octagonTileGeometry.inscribedCircleRadius;
        const octagonTileInscribedCircleDiameter = octagonTileInscribedCircleRadius * 2;
        if (tileIsOctagon) {
            result.targetPositionPoint = new Point(
                targetTilePosition.columnIndex * octagonTileInscribedCircleDiameter
                    + octagonTileInscribedCircleRadius,
                targetTilePosition.rowIndex / 2.0 * octagonTileInscribedCircleDiameter
                    + octagonTileInscribedCircleRadius
            );
        } else {
            result.targetPositionPoint = new Point(
                // ceil - чтобы избежать зазоров
                Math.ceil((targetTilePosition.columnIndex + 1)
                    * octagonTileInscribedCircleDiameter),
                // ceil - чтобы избежать зазоров
                Math.ceil((targetTilePosition.rowIndex + 1) / 2.0
                    * octagonTileInscribedCircleDiameter)
            );
        }
            
        return result;
    }
}