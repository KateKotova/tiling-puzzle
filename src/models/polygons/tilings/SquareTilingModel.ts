import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RegularPolygonTileModel } from "../tiles/RegularPolygonTileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";

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
            - this.textureTileSide * this.textureTileColumnCount) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * this.textureTileRowCount) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileCircumscribedCircleRadius = Math.sqrt(2) / 2.0 * this.tileSide;
    }

    protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
            : RegularPolygonTileModel {
            
        const result = new RegularPolygonTileModel();
        result.position = new RectangularGridTilePosition(rowIndex, columnIndex);
        result.side = this.tileSide;
        result.sideCount = 4;
        result.rotationAngle = 0;
        result.regularPolygonInitialRotationAngle = Math.PI / 4;
        result.rotatingBoundingRectangle = new Rectangle(
            columnIndex * this.tileSide,
            rowIndex * this.tileSide,
            this.tileSide,
            this.tileSide
        );
        result.absoluteBoundingRectangle = result.rotatingBoundingRectangle;
        result.circumscribedCircleRadius = this.tileCircumscribedCircleRadius;
        result.centerPoint = new Point(result.rotatingBoundingRectangle.x + this.tileSide / 2.0,
            result.rotatingBoundingRectangle.y + this.tileSide / 2.0);
        return result;
    }
}