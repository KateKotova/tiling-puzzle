import { Graphics, Point, Rectangle, Renderer, Texture } from "pixi.js";
import { TilingType } from "../../TilingType.ts";
import { TilingModel } from "../../TilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { TilingContainerModel } from "../../TilingContainerModel.ts";
import { TriangleTileModel } from "../tiles/TriangleTileModel.ts";

export class TriangleTilingModel implements TilingModel {
    public static readonly tilingType: TilingType = TilingType.Triangle;

    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 2;

    public textureModel: TilingTextureModel;
    private textureTileSide: number = 0;
    private textureTileHeight: number = 0;
    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;
    private textureXTilingOffset: number = 0;
    private textureYTilingOffset: number = 0;

    private imageContainerModel: ImageContainerModel;
    public tilingContainerModel: TilingContainerModel;

    public tileSide: number = 0;
    public tileHeight: number = 0;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount < TriangleTilingModel.textureMinSideMinTilePairCount
                ? TriangleTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;

        this.initializeTextureTileInfo();
        
        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);
        
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileHeight = this.textureTileHeight * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getTilingType(): TilingType {
        return TriangleTilingModel.tilingType;
    }

    private initializeTextureTileInfo(): void {
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (this.textureMinSideTilePairCount + 0.5);
            this.textureTileHeight = Math.sqrt(3) / 2 * this.textureTileSide;
        } else {
            this.textureTileHeight = this.textureModel.minSide / this.textureMinSideTilePairCount;
            this.textureTileSide = 2 / Math.sqrt(3) * this.textureTileHeight;
        }

        this.textureTileColumnCount = 2 * Math.trunc(
            (this.textureModel.width - this.textureTileSide / 2) / this.textureTileSide);
        this.textureTileRowCount = Math.trunc(this.textureModel.height / this.textureTileHeight);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide / 2 * (this.textureTileColumnCount + 1)) / 2;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileHeight * this.textureTileRowCount) / 2;
    }

    public getImageTileTexture(rowIndex: number, columnIndex: number): Texture | undefined {
        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);

        if (rowIndex < 0
            || rowIndex >= this.textureTileRowCount
            || columnIndex < 0
            || columnIndex >= this.textureTileColumnCount) {
            return undefined;
        }

        const globalTile = new Graphics()
            .rect(
                columnIndex * this.textureTileSide / 2 + this.textureXTilingOffset,
                rowIndex * this.textureTileHeight + this.textureYTilingOffset,
                this.textureTileSide,
                this.textureTileHeight
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
        shouldGetTexture: boolean = true): TriangleTileModel {
        
        const tileSideHalf = this.tileSide / 2;
        const result = new TriangleTileModel();
        result.side = this.tileSide;
        result.boundingRectangle = new Rectangle(
            columnIndex * tileSideHalf,
            rowIndex * this.tileHeight,
            this.tileSide,
            this.tileHeight
        );

        result.circumscribedCircleRadius = this.tileHeight * 2 / 3;

        const tileIsRotated = (rowIndex % 2 == 0 && columnIndex % 2 == 0)
            || (rowIndex % 2 == 1 && columnIndex % 2 == 1);
        if (tileIsRotated) {
            result.rotationAngle = Math.PI;
        }

        const centerPointY = tileIsRotated
            ? result.boundingRectangle.y + this.tileHeight / 3
            : result.boundingRectangle.y + result.circumscribedCircleRadius;
        result.centerPoint = new Point(result.boundingRectangle.x + tileSideHalf, centerPointY);

        if (shouldGetTexture) {
            result.texture = this.getImageTileTexture(rowIndex, columnIndex);
        }

        return result;
    }
}