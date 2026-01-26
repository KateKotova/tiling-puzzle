import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";

export class SquareTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.Square;

    public textureMinSideTileCount: number;
    public static readonly textureMinSideMinTileCount = 2;

    //#region Texture tile info

    private textureTileSide: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    public tileCircumscribedCircleRadius: number = 0;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(textureModel, imageContainerModel, renderer);
        this.textureMinSideTileCount
            = textureMinSideTileCount < SquareTilingModel.textureMinSideMinTileCount
                ? SquareTilingModel.textureMinSideMinTileCount
                : Math.floor(textureMinSideTileCount);
    }

    public getTilingType(): TilingType {
        return SquareTilingModel.tilingType;
    }

    protected initializeTextureTileInfo(): void {
        this.textureTileSide = this.textureModel.minSide / this.textureMinSideTileCount;

        this.textureTileColumnCount = Math.trunc(this.textureModel.width / this.textureTileSide);
        this.textureTileRowCount = Math.trunc(this.textureModel.height / this.textureTileSide);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.textureTileColumnCount) / 2;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * this.textureTileRowCount) / 2;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileCircumscribedCircleRadius = Math.sqrt(2) / 2 * this.tileSide;
    }

    protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
            : RegularPolygonTileModel {
            
        const result = super.getTileModelWithoutTexture(rowIndex, columnIndex);
        result.side = this.tileSide;
        result.sideCount = 4;
        result.rotationAngle = Math.PI / 4;
        result.boundingRectangle = new Rectangle(
            columnIndex * this.tileSide,
            rowIndex * this.tileSide,
            this.tileSide,
            this.tileSide
        );
        result.circumscribedCircleRadius = this.tileCircumscribedCircleRadius;
        result.centerPoint = new Point(result.boundingRectangle.x + this.tileSide / 2,
            result.boundingRectangle.y + this.tileSide / 2);
        return result;
    }
}