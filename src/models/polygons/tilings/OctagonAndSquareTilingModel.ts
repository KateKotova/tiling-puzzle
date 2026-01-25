import { Graphics, Point, Rectangle, Renderer, Texture } from "pixi.js";
import { TilingType } from "../../TilingType.ts";
import { TilingModel } from "../../TilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { TilingContainerModel } from "../../TilingContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";

export class OctagonAndSquareTilingModel implements TilingModel {
    public static readonly tilingType: TilingType = TilingType.OctagonAndSquare;

    public textureMinSideOctagonTileCount: number;
    public static readonly textureMinSideMinOctagonTileCount = 2;

    public textureModel: TilingTextureModel;
    private textureTileSide: number = 0;
    private textureOctagonTileWidthOrHeight: number = 0;
    private textureSquareTileWidthOrHeight: number = 0;
    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;
    private textureXTilingOffset: number = 0;
    private textureYTilingOffset: number = 0;

    private imageContainerModel: ImageContainerModel;
    public tilingContainerModel: TilingContainerModel;

    public tileSide: number = 0;
    public octagonTileWidthOrHeight: number = 0;
    public squareTileWidthOrHeight: number = 0;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        textureMinSideOctagonTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureMinSideOctagonTileCount
            = textureMinSideOctagonTileCount
                < OctagonAndSquareTilingModel.textureMinSideMinOctagonTileCount
                ? OctagonAndSquareTilingModel.textureMinSideMinOctagonTileCount
                : Math.floor(textureMinSideOctagonTileCount);

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;

        this.initializeTextureTileInfo();
        
        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);

        this.initializeImageTileInfo();
    }

    public getTilingType(): TilingType {
        return OctagonAndSquareTilingModel.tilingType;
    }

    private initializeTextureTileInfo(): void {
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

        this.textureOctagonTileWidthOrHeight = this.textureTileSide * sqrt2PlusOne;
        this.squareTileWidthOrHeight = sqrt2 * this.textureTileSide;

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.textureTileColumnCount) / 2;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * (this.textureTileRowCount / 2 + 0.5)) / 2;
    }

    private initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonTileWidthOrHeight = this.textureOctagonTileWidthOrHeight
            * this.imageContainerModel.sideToTextureSideRatio;
        this.squareTileWidthOrHeight = this.textureSquareTileWidthOrHeight
            * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getImageTileTexture(rowIndex: number, columnIndex: number): Texture | undefined {
        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);

        if (rowIndex < 0
            || rowIndex >= this.textureTileRowCount
            || columnIndex < 0
            || columnIndex >= this.textureTileColumnCount - (rowIndex % 2)) {
            return undefined;
        }

        // TODO От boundingRectangle
        const globalTile = new Graphics()
            .rect(
                columnIndex * this.textureTileSide / 2 * 3 + this.textureXTilingOffset,
                rowIndex * this.textureOctagonTileHeight
                    + (columnIndex % 2 == 1 ? this.textureOctagonTileHeight / 2 : 0)
                    + this.textureYTilingOffset,
                this.textureOctagonTileWidthOrHeight,
                this.textureOctagonTileHeight
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global"
            });

        const result = this.renderer.generateTexture(globalTile);
        globalTile.destroy();
        return result;
    }

    public getTileModel(rowIndex: number,
        columnIndex: number,
        shouldGetTexture: boolean = true): RegularPolygonTileModel {
        
        const result = new RegularPolygonTileModel();
        result.side = this.tileSide;
        result.sideCount = 6;
        result.rotationAngle = Math.PI / 2;
        result.boundingRectangle = new Rectangle(
            columnIndex * this.tileSide / 2 * 3,
            rowIndex * this.octagonTileHeight + (columnIndex % 2 == 1 ? this.octagonTileHeight / 2 : 0),
            this.octagonTileWidthOrHeight,
            this.octagonTileHeight
        );
        result.circumscribedCircleRadius = this.tileSide;
        result.centerPoint = new Point(result.boundingRectangle.x + this.octagonTileWidthOrHeight / 2,
            result.boundingRectangle.y + this.octagonTileHeight / 2);

        if (shouldGetTexture) {
            result.texture = this.getImageTileTexture(rowIndex, columnIndex);
        }

        return result;
    }
}