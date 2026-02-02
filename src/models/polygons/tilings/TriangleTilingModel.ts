import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { Size } from "../../math/Size.ts";
import { ModelSettings } from "../../ModelSettings.ts";

export class TriangleTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.Triangle;

    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 1;

    //#region Texture tile info

    private textureTileSide: number = 0;
    private textureTileHeight: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    public tileHeight: number = 0;
    public tileCircumscribedCircleRadius: number = 0;

    constructor(modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(modelSettings, textureModel, imageContainerModel, renderer);
        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount < TriangleTilingModel.textureMinSideMinTilePairCount
                ? TriangleTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    public getTilingType(): TilingType {
        return TriangleTilingModel.tilingType;
    }

    protected initializeTextureTileInfo(): void {
        const sqrt3 = Math.sqrt(3);
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (this.textureMinSideTilePairCount + 0.5);
            this.textureTileHeight = sqrt3 / 2.0 * this.textureTileSide;
        } else {
            this.textureTileHeight = this.textureModel.minSide / this.textureMinSideTilePairCount / 2;
            this.textureTileSide = 2 / sqrt3 * this.textureTileHeight;
        }

        this.textureTileColumnCount = 2 * Math.trunc(
            (this.textureModel.width - this.textureTileSide / 2.0) / this.textureTileSide);
        this.textureTileRowCount = Math.trunc(this.textureModel.height / this.textureTileHeight);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide / 2.0 * (this.textureTileColumnCount + 1)) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileHeight * this.textureTileRowCount) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileHeight = this.textureTileHeight * this.imageContainerModel.sideToTextureSideRatio;
        this.tileCircumscribedCircleRadius = Math.ceil(this.tileHeight * 2 / 3.0);
    }

    protected getProtectedTileModel(rowIndex: number, columnIndex: number)
        : RegularPolygonTileModel {
            
        const result = new RegularPolygonTileModel(this.modelSettings);
        result.position = new RectangularGridTilePosition(rowIndex, columnIndex);
        const tileSideHalf = this.tileSide / 2.0;
        result.side = this.tileSide;
        result.sideCount = 3;
        result.rotationAngle = 0;
        result.regularPolygonInitialRotationAngle = 0;
        result.absoluteBoundingRectangle = new Rectangle(
            columnIndex * tileSideHalf,
            rowIndex * this.tileHeight,
            this.tileSide,
            this.tileHeight
        );
        result.rotatingBoundingRectangleSize = new Size(this.tileSide, this.tileHeight);
        result.circumscribedCircleRadius = this.tileCircumscribedCircleRadius;

        const tileIsRotated = (rowIndex % 2 == 0 && columnIndex % 2 == 0)
            || (rowIndex % 2 == 1 && columnIndex % 2 == 1);
        if (tileIsRotated) {
            result.regularPolygonInitialRotationAngle = Math.PI;
        }

        result.pivotPoint = new Point(tileSideHalf,
            this.tileHeight * (tileIsRotated ? 1 : 2) / 3.0);
        result.positionPoint = new Point(result.absoluteBoundingRectangle.x + result.pivotPoint.x,
            result.absoluteBoundingRectangle.y + result.pivotPoint.y);

        return result;
    }
}