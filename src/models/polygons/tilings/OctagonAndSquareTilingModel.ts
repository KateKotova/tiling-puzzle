import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { Size } from "../../geometry/Size.ts";

export class OctagonAndSquareTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.OctagonAndSquare;

    public textureMinSideOctagonTileCount: number;
    public static readonly textureMinSideMinOctagonTileCount = 2;

    //#region Texture tile info

    private textureTileSide: number = 0;
    private textureOctagonTileBoundingSide: number = 0;
    private textureSquareTileBoundingSide: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    public octagonTileBoundingSide: number = 0;
    public squareTileBoundingSide: number = 0;
    public octagonTileCircumscribedCircleRadius: number = 0;
    public squareTileCircumscribedCircleRadius: number = 0;

    constructor(textureModel: TilingTextureModel,
        textureMinSideOctagonTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(textureModel, imageContainerModel, renderer);
        this.textureMinSideOctagonTileCount
            = textureMinSideOctagonTileCount
                < OctagonAndSquareTilingModel.textureMinSideMinOctagonTileCount
                ? OctagonAndSquareTilingModel.textureMinSideMinOctagonTileCount
                : Math.floor(textureMinSideOctagonTileCount);
    }

    public getTilingType(): TilingType {
        return OctagonAndSquareTilingModel.tilingType;
    }

    protected initializeTextureTileInfo(): void {
        const sqrt2 = Math.sqrt(2);
        const sqrt2PlusOne = sqrt2 + 1;
        this.textureTileSide = this.textureModel.minSide / this.textureMinSideOctagonTileCount
            / sqrt2PlusOne;
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileColumnCount = this.textureMinSideOctagonTileCount;
            this.textureTileRowCount = 2 * Math.trunc(this.textureModel.height / this.textureTileSide
                / sqrt2PlusOne) - 1;
        } else {
            this.textureTileColumnCount = Math.trunc(
                this.textureModel.width / this.textureTileSide / sqrt2PlusOne);
            this.textureTileRowCount = 2 * this.textureMinSideOctagonTileCount - 1;
        }

        this.textureOctagonTileBoundingSide = this.textureTileSide * sqrt2PlusOne;
        this.textureSquareTileBoundingSide = sqrt2 * this.textureTileSide;

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureOctagonTileBoundingSide * this.textureTileColumnCount) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureOctagonTileBoundingSide * (this.textureTileRowCount / 2.0 + 0.5)) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonTileBoundingSide = this.textureOctagonTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
        this.squareTileBoundingSide = this.textureSquareTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
        const sqrt2 = Math.sqrt(2);
        this.octagonTileCircumscribedCircleRadius = Math.ceil(
            this.tileSide / Math.sqrt(2 - sqrt2));
        this.squareTileCircumscribedCircleRadius = Math.ceil(sqrt2 / 2.0 * this.tileSide);
    }

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.textureTileRowCount
            && columnIndex >= 0
            && columnIndex < this.textureTileColumnCount - (rowIndex % 2);
    }

    protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
            : RegularPolygonTileModel {
            
        const result = new RegularPolygonTileModel();
        result.position = new RectangularGridTilePosition(rowIndex, columnIndex);
        result.side = this.tileSide;
        result.rotationAngle = 0;

        if (rowIndex % 2 == 0) {
            result.sideCount = 8;
            result.regularPolygonInitialRotationAngle = 3 / 8.0 * Math.PI;
            result.absoluteBoundingRectangle = new Rectangle(
                columnIndex * this.octagonTileBoundingSide,
                rowIndex / 2.0 * this.octagonTileBoundingSide,
                this.octagonTileBoundingSide,
                this.octagonTileBoundingSide
            );
            result.circumscribedCircleRadius = this.octagonTileCircumscribedCircleRadius;
        } else {
            result.sideCount = 4;
            result.regularPolygonInitialRotationAngle = 0;
            const offset = this.tileSide + this.squareTileBoundingSide / 2.0;
            result.absoluteBoundingRectangle = new Rectangle(
                this.octagonTileBoundingSide * columnIndex + offset,
                this.octagonTileBoundingSide * (rowIndex - 1) / 2.0 + offset + 0.5,
                this.squareTileBoundingSide,
                this.squareTileBoundingSide
            );
            result.circumscribedCircleRadius = this.squareTileCircumscribedCircleRadius;
        }

        result.rotatingBoundingRectangleSize = new Size(result.absoluteBoundingRectangle.width,
            result.absoluteBoundingRectangle.height);
        result.pivotPoint = new Point(result.absoluteBoundingRectangle.width / 2.0,
            result.absoluteBoundingRectangle.height / 2.0);
        result.centerPoint = new Point(result.absoluteBoundingRectangle.x + result.pivotPoint.x,
            result.absoluteBoundingRectangle.y + result.pivotPoint.y);
        return result;
    }
}