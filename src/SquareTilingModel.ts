import { Graphics, Rectangle, Renderer, Texture } from "pixi.js";
import { TilingTextureModel } from "./TilingTextureModel.ts";
import { ImageContainerModel } from "./ImageContainerModel.ts";
import { SquareTileModel } from "./SquareTileModel.ts";

export class SquareTilingModel {
    public textureMinSideTileCount: number;
    public static readonly textureMinSideMinTileCount = 2;

    public textureModel: TilingTextureModel;
    private textureTileSide: number = 0;
    public textureWidthTileCount: number = 0;
    public textureHeightTileCount: number = 0;
    private textureXTilesOffset: number = 0;
    private textureYTilesOffset: number = 0;

    public imageContainerModel: ImageContainerModel;
    public tilingContainerRectangle: Rectangle = new Rectangle();
    public tileSide: number = 0;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureMinSideTileCount
            = textureMinSideTileCount < SquareTilingModel.textureMinSideMinTileCount
                ? SquareTilingModel.textureMinSideMinTileCount
                : Math.floor(textureMinSideTileCount);

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;

        this.initialiazeTextureTileInfo();        
        this.initialiazeImageTileInfo();
    }

    private initialiazeTextureTileInfo(): void {
        this.textureTileSide = this.textureModel.minSide / this.textureMinSideTileCount;

        this.textureWidthTileCount = Math.trunc(this.textureModel.width / this.textureTileSide);
        this.textureHeightTileCount = Math.trunc(this.textureModel.height / this.textureTileSide);

        this.textureXTilesOffset = (this.textureModel.width
            - this.textureTileSide * this.textureWidthTileCount) / 2;
        this.textureYTilesOffset = (this.textureModel.height
            - this.textureTileSide * this.textureHeightTileCount) / 2;
    }

    private initialiazeImageTileInfo(): void {
        const tilingContainerXOffset = this.textureXTilesOffset
            * this.imageContainerModel.sideToTextureSideRatio;
        const tilingContainerYOffset = this.textureYTilesOffset
            * this.imageContainerModel.sideToTextureSideRatio;
    
        this.tilingContainerRectangle = new Rectangle(
            tilingContainerXOffset,
            tilingContainerYOffset,
            this.imageContainerModel.width - tilingContainerXOffset * 2,
            this.imageContainerModel.height - tilingContainerYOffset * 2,
        );
    
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getImageTileTexture(rowIndex: number, columnIndex: number): Texture | undefined {
        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);

        if (rowIndex < 0
            || rowIndex >= this.textureHeightTileCount
            || columnIndex < 0
            || columnIndex >= this.textureWidthTileCount) {
            return undefined;
        }

        const globalTile = new Graphics()
            .rect(
                columnIndex * this.textureTileSide + this.textureXTilesOffset,
                rowIndex * this.textureTileSide + this.textureYTilesOffset,
                this.textureTileSide,
                this.textureTileSide
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
        shouldGetTexture: boolean = true): SquareTileModel {
        
        const result = new SquareTileModel();
        result.side = this.tileSide;
        result.boundingRectangle = new Rectangle(
            columnIndex * this.tileSide,
            rowIndex * this.tileSide,
            this.tileSide,
            this.tileSide
        );

        if (shouldGetTexture) {
            result.texture = this.getImageTileTexture(rowIndex, columnIndex);
        }

        return result;
    }
}