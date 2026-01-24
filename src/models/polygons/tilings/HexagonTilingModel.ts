import { Graphics, Point, Rectangle, Renderer, Texture } from "pixi.js";
import { TilingType } from "../../TilingType.ts";
import { TilingModel } from "../../TilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { TilingContainerModel } from "../../TilingContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";

export class HexagonTilingModel implements TilingModel {
    public static readonly tilingType: TilingType = TilingType.Hexagon;

    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 2;

    public textureModel: TilingTextureModel;
    private textureTileSide: number = 0;
    private textureTileWidth: number = 0;
    private textureTileHeight: number = 0;
    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;
    private textureXTilingOffset: number = 0;
    private textureYTilingOffset: number = 0;

    private imageContainerModel: ImageContainerModel;
    public tilingContainerModel: TilingContainerModel;

    public tileSide: number = 0;
    public tileWidth: number = 0;
    public tileHeight: number = 0;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount < HexagonTilingModel.textureMinSideMinTilePairCount
                ? HexagonTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;

        this.initializeTextureTileInfo();
        
        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);
        
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileWidth = this.textureTileWidth * this.imageContainerModel.sideToTextureSideRatio;
        this.tileHeight = this.textureTileHeight * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getTilingType(): TilingType {
        return HexagonTilingModel.tilingType;
    }

    private initializeTextureTileInfo(): void {
        const sqrt3 = Math.sqrt(3);
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (0.5 + 3 * this.textureMinSideTilePairCount);
            this.textureTileColumnCount = 2 * this.textureMinSideTilePairCount;
            this.textureTileRowCount = Math.trunc(this.textureModel.height
                / this.textureTileSide / sqrt3 - 0.5);
        } else {
            this.textureTileSide = this.textureModel.minSide / sqrt3
                / (this.textureMinSideTilePairCount + 0.5);
            this.textureTileColumnCount = 2 * Math.trunc((this.textureModel.width
                / this.textureTileSide - 0.5) / 3);
            this.textureTileRowCount = this.textureMinSideTilePairCount;
        }

        this.textureTileWidth = 2 * this.textureTileSide;
        this.textureTileHeight = sqrt3 * this.textureTileSide;

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * (0.5 + 3 / 2 * this.textureTileColumnCount)) / 2;
        this.textureYTilingOffset = (this.textureModel.height
            - sqrt3 * this.textureTileSide * (this.textureTileRowCount + 0.5)) / 2;
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
                columnIndex * this.textureTileSide / 2 * 3 + this.textureXTilingOffset,
                rowIndex * this.textureTileHeight
                    + (columnIndex % 2 == 1 ? this.textureTileHeight / 2 : 0)
                    + this.textureYTilingOffset,
                this.textureTileWidth,
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
        shouldGetTexture: boolean = true): RegularPolygonTileModel {
        
        const result = new RegularPolygonTileModel();
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

        if (shouldGetTexture) {
            result.texture = this.getImageTileTexture(rowIndex, columnIndex);
        }

        return result;
    }
}