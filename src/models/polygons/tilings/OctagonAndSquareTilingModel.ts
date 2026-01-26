//import { Graphics, Point, Rectangle, Renderer, Texture } from "pixi.js";
import { Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
//import { TilingContainerModel } from "../../TilingContainerModel.ts";
//import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";

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
            this.textureTileColumnCount = 2 * Math.trunc(
                this.textureModel.width / this.textureTileSide / sqrt2PlusOne);
            this.textureTileRowCount = 2 * this.textureMinSideOctagonTileCount - 1;
        }

        this.textureOctagonTileBoundingSide = this.textureTileSide * sqrt2PlusOne;
        this.squareTileBoundingSide = sqrt2 * this.textureTileSide;

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.textureTileColumnCount) / 2;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * (this.textureTileRowCount / 2 + 0.5)) / 2;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonTileBoundingSide = this.textureOctagonTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
        this.squareTileBoundingSide = this.textureSquareTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.textureTileRowCount
            && columnIndex >= 0
            && columnIndex < this.textureTileColumnCount - (rowIndex % 2);
    }

    /*protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
            : RegularPolygonTileModel {
            
        const result = super.getTileModelWithoutTexture(rowIndex, columnIndex);
        result.side = this.tileSide;
        result.sideCount = 6;
        result.rotationAngle = Math.PI / 2;
        result.boundingRectangle = new Rectangle(
            columnIndex * this.tileSide / 2 * 3,
            rowIndex * this.tileHeight + (columnIndex % 2 == 1 ? this.tileHeight / 2 : 0),
            this.tileWidth,
            this.tileHeight
        );
        result.circumscribedCircleRadius = this.tileSide;
        result.centerPoint = new Point(result.boundingRectangle.x + this.tileWidth / 2,
            result.boundingRectangle.y + this.tileHeight / 2);
        return result;
    }*/
}