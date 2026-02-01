import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { TileLockType } from "../../tiles/TileLockType.ts";
import { RegularPolygonWithSingleLockTileModel } from "../tiles/RegularPolygonWithSingleLockTileModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { Size } from "../../geometry/Size.ts";
import { TileType } from "../../tiles/TileType.ts";
import { TileLockHeightToSideRatios } from "../../tiles/TileLockHeightToSideRatios.ts";

export class SquareWithSingleLockTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.SquareWithSingleLock;
    public static readonly lockType: TileLockType = TileLockType.Single;

    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 1;

    //#region Texture tile info

    private textureTileSide: number = 0;
    private textureLockHeight: number = 0;
    private textureTileMinSide: number = 0;
    private textureTileMaxSide: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    private lockHeight: number = 0;
    public tileMinSide: number = 0;
    public tileMaxSide: number = 0;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(textureModel, imageContainerModel, renderer);
        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount
            < SquareWithSingleLockTilingModel.textureMinSideMinTilePairCount
                ? SquareWithSingleLockTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    public getTilingType(): TilingType {
        return SquareWithSingleLockTilingModel.tilingType;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToSideRatios[SquareWithSingleLockTilingModel.lockType];
    }

    protected initializeTextureTileInfo(): void {
        const lockHeightToSideRatio = this.getLockHeightToSideRatio();
        this.textureTileSide = this.textureModel.minSide
            / (this.textureMinSideTilePairCount + lockHeightToSideRatio) / 2;
        this.textureLockHeight = this.textureTileSide * lockHeightToSideRatio;

        this.textureTileMinSide = this.textureTileSide;
        this.textureTileMaxSide = this.textureTileSide + 2 * this.textureLockHeight;

        this.textureTileColumnCount = Math.trunc(
            (this.textureModel.width - this.textureLockHeight * 2) / this.textureTileSide);
        this.textureTileRowCount = Math.trunc(
            (this.textureModel.height - this.textureLockHeight * 2) / this.textureTileSide);

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * this.textureTileColumnCount - 2 * this.textureLockHeight) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureTileSide * this.textureTileRowCount - 2 * this.textureLockHeight) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.lockHeight = this.textureLockHeight * this.imageContainerModel.sideToTextureSideRatio;
        this.tileMinSide = this.textureTileMinSide * this.imageContainerModel.sideToTextureSideRatio;
        this.tileMaxSide = this.textureTileMaxSide * this.imageContainerModel.sideToTextureSideRatio;
    }

    protected getProtectedTileModel(rowIndex: number, columnIndex: number)
        : RegularPolygonWithSingleLockTileModel {
            
        const result = new RegularPolygonWithSingleLockTileModel();
        result.tileType = TileType.SquareWithSingleLock;
        result.position = new RectangularGridTilePosition(rowIndex, columnIndex);
        result.side = this.tileSide;
        const tileIsRotated = (rowIndex + columnIndex) % 2 == 1;
        result.rotationAngle = tileIsRotated ? Math.PI / 2 : 0;
        result.absoluteBoundingRectangle = tileIsRotated
            ? new Rectangle(
                columnIndex * this.tileSide,
                rowIndex * this.tileSide + this.lockHeight,
                this.tileMaxSide,
                this.tileMinSide
            )
            : new Rectangle(
                columnIndex * this.tileSide + this.lockHeight,
                rowIndex * this.tileSide,
                this.tileMinSide,
                this.tileMaxSide
            );
        result.rotatingBoundingRectangleSize = new Size(this.tileMinSide, this.tileMaxSide);
        result.pivotPoint = new Point(this.tileMinSide / 2.0, this.tileMaxSide / 2.0);
        result.positionPoint = new Point(
            result.absoluteBoundingRectangle.x + result.absoluteBoundingRectangle.width / 2.0,
            result.absoluteBoundingRectangle.y + result.absoluteBoundingRectangle.height / 2.0);

        result.hitAreaSideCount = 4;
        result.hitAreaCircumscribedCircleRadius = Math.sqrt(2) / 2.0 * this.tileSide;
        result.hitAreaInitialRotationAngle = Math.PI / 4;

        return result;
    }
}