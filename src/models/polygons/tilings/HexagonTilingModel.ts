import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";

export class HexagonTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.Hexagon;

    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 2;

    //#region Texture tile info

    private textureTileSide: number = 0;
    private textureTileWidth: number = 0;
    private textureTileHeight: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    public tileWidth: number = 0;
    public tileHeight: number = 0;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(textureModel, imageContainerModel, renderer);
        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount < HexagonTilingModel.textureMinSideMinTilePairCount
                ? HexagonTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    public getTilingType(): TilingType {
        return HexagonTilingModel.tilingType;
    }

    protected initializeTextureTileInfo(): void {
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

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileWidth = this.textureTileWidth * this.imageContainerModel.sideToTextureSideRatio;
        this.tileHeight = this.textureTileHeight * this.imageContainerModel.sideToTextureSideRatio;
    }

    protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
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
    }
}