import { Graphics, Point, Rectangle, Renderer, Texture } from "pixi.js";
import { TilingType } from "../../TilingType.ts";
import { TilingModel } from "../../TilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { TilingContainerModel } from "../../TilingContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";

export class SquareTilingModel implements TilingModel {
    public static readonly tilingType: TilingType = TilingType.Square;

    public textureMinSideTileCount: number;
    public static readonly textureMinSideMinTileCount = 2;

    public textureModel: TilingTextureModel;
    private textureTileSide: number = 0;
    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;
    private textureXTilingOffset: number = 0;
    private textureYTilingOffset: number = 0;

    private imageContainerModel: ImageContainerModel;
    public tilingContainerModel: TilingContainerModel;
    
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

        this.initializeTextureTileInfo();

        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);
        
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getTilingType(): TilingType {
        return SquareTilingModel.tilingType;
    }

    private initializeTextureTileInfo(): void {
        this.textureTileSide = this.textureModel.minSide / this.textureMinSideTileCount;

        this.textureTileColumnCount = Math.trunc(this.textureModel.width / this.textureTileSide);
        this.textureTileRowCount = Math.trunc(this.textureModel.height / this.textureTileSide);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.textureTileColumnCount) / 2;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * this.textureTileRowCount) / 2;
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
                columnIndex * this.textureTileSide + this.textureXTilingOffset,
                rowIndex * this.textureTileSide + this.textureYTilingOffset,
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
        shouldGetTexture: boolean = true): RegularPolygonTileModel {
        
        const result = new RegularPolygonTileModel();
        result.side = this.tileSide;
        result.sideCount = 4;
        result.rotationAngle = Math.PI / 4;
        result.boundingRectangle = new Rectangle(
            columnIndex * this.tileSide,
            rowIndex * this.tileSide,
            this.tileSide,
            this.tileSide
        );
        result.circumscribedCircleRadius = Math.sqrt(2) / 2 * this.tileSide;
        result.centerPoint = new Point(result.boundingRectangle.x + this.tileSide / 2,
            result.boundingRectangle.y + this.tileSide / 2);

        if (shouldGetTexture) {
            result.texture = this.getImageTileTexture(rowIndex, columnIndex);
        }

        return result;
    }
}