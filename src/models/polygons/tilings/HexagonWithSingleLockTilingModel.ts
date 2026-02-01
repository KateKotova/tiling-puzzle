import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { Size } from "../../geometry/Size.ts";
import { TileLockHeightToSideRatios } from "../../tiles/TileLockHeightToSideRatios.ts";
import { TileLockType } from "../../tiles/TileLockType.ts";
import { RegularPolygonWithSingleLockTileModel } from "../tiles/RegularPolygonWithSingleLockTileModel.ts";
import { TileType } from "../../tiles/TileType.ts";

export class HexagonWithSingleLockTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.HexagonWithSingleLock;
    public static readonly lockType: TileLockType = TileLockType.Single;

    public textureMinSideTilePairCount: number;
    public static readonly textureMinSideMinTilePairCount = 1;

    //#region Texture tile info

    private textureTileSide: number = 0;
    private textureLockHeight: number = 0;
    private textureTileWidth: number = 0;
    private textureTileHeight: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    private lockHeight: number = 0;
    public tileWidth: number = 0;
    public tileHeight: number = 0;

    constructor(textureModel: TilingTextureModel,
        textureMinSideTilePairCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(textureModel, imageContainerModel, renderer);
        this.textureMinSideTilePairCount
            = textureMinSideTilePairCount
                < HexagonWithSingleLockTilingModel.textureMinSideMinTilePairCount
                ? HexagonWithSingleLockTilingModel.textureMinSideMinTilePairCount
                : Math.floor(textureMinSideTilePairCount);
    }

    public getTilingType(): TilingType {
        return HexagonWithSingleLockTilingModel.tilingType;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToSideRatios[HexagonWithSingleLockTilingModel.lockType];
    }

    protected initializeTextureTileInfo(): void {
        const lockHeightToSideRatio = this.getLockHeightToSideRatio();
        const sqrt3 = Math.sqrt(3);
        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileSide = this.textureModel.minSide
                / (0.5 + 3 * this.textureMinSideTilePairCount);
            this.textureLockHeight = this.textureTileSide * lockHeightToSideRatio;
            this.textureTileColumnCount = 2 * this.textureMinSideTilePairCount;
            this.textureTileRowCount = Math.trunc((this.textureModel.height - this.textureLockHeight)
                / this.textureTileSide / sqrt3 - 0.5);
        } else {
            this.textureTileSide = this.textureModel.minSide / sqrt3
                / (this.textureMinSideTilePairCount * 2 + 0.5 + lockHeightToSideRatio / 2);
            this.textureLockHeight = this.textureTileSide * lockHeightToSideRatio;
            this.textureTileColumnCount = 2 * Math.trunc((this.textureModel.width
                / this.textureTileSide - 0.5) / 3.0);
            this.textureTileRowCount = 2 * this.textureMinSideTilePairCount;
        }

        this.textureTileWidth = 2 * this.textureTileSide;
        this.textureTileHeight = sqrt3 * this.textureTileSide + this.textureLockHeight;

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureTileSide * (0.5 + 3 / 2.0 * this.textureTileColumnCount)) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height - this.textureLockHeight
            - sqrt3 * this.textureTileSide * (this.textureTileRowCount + 0.5)) / 2.0;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.lockHeight = this.textureLockHeight * this.imageContainerModel.sideToTextureSideRatio;
        this.tileWidth = this.textureTileWidth * this.imageContainerModel.sideToTextureSideRatio;
        this.tileHeight = this.textureTileHeight * this.imageContainerModel.sideToTextureSideRatio;
    }

    protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
            : RegularPolygonWithSingleLockTileModel {
            
        const result = new RegularPolygonWithSingleLockTileModel();
        result.tileType = TileType.HexagonWithSingleLock;
        result.position = new RectangularGridTilePosition(rowIndex, columnIndex);
        result.side = this.tileSide;
        result.rotationAngle = 0;
        const tileHeightWithoutLock = this.tileHeight - this.lockHeight;
        result.absoluteBoundingRectangle = new Rectangle(
            columnIndex * this.tileSide / 2.0 * 3,
            rowIndex * tileHeightWithoutLock
                + (columnIndex % 2 == 1 ? tileHeightWithoutLock / 2.0 : 0),
            this.tileWidth,
            this.tileHeight
        );
        result.rotatingBoundingRectangleSize = new Size(this.tileWidth, this.tileHeight);
        result.pivotPoint = new Point(this.tileWidth / 2.0,
            (this.tileHeight + this.lockHeight) / 2.0);
        result.positionPoint = new Point(result.absoluteBoundingRectangle.x + result.pivotPoint.x,
            result.absoluteBoundingRectangle.y + result.pivotPoint.y);        

        result.hitAreaSideCount = 6;
        result.hitAreaCircumscribedCircleRadius = this.tileSide;
        result.hitAreaInitialRotationAngle = Math.PI / 2;

        return result;
    }
}