import { Point, Rectangle, Renderer } from "pixi.js";
import { TilingType } from "../../tilings/TilingType.ts";
import { RectangularGridTilingModel } from "../../tilings/RectangularGridTilingModel.ts";
import { TilingTextureModel } from "../../TilingTextureModel.ts";
import { ImageContainerModel } from "../../ImageContainerModel.ts";
import { RectangularGridTilePosition } from "../../tiles/RectangularGridTilePosition.ts";
import { Size } from "../../geometry/Size.ts";
import { TileLockType } from "../../tiles/TileLockType.ts";
import { TileLockHeightToSideRatios } from "../../tiles/TileLockHeightToSideRatios.ts";
import { RegularPolygonWithSingleLockTileModel } from "../tiles/RegularPolygonWithSingleLockTileModel.ts";
import { TileType } from "../../tiles/TileType.ts";

export class OctagonAndSquareWithSpiralLockTilingModel extends RectangularGridTilingModel {
    public static readonly tilingType: TilingType = TilingType.OctagonAndSquareWithSingleLock;
    public static readonly lockType: TileLockType = TileLockType.Single;

    public textureMinSideOctagonTileCount: number;
    public static readonly textureMinSideMinOctagonTileCount = 1;

    //#region Texture tile info

    private textureTileSide: number = 0;
    private textureLockHeight: number = 0;
    private textureOctagonTileBoundingSide: number = 0;
    private textureRotatedOctagonTileBoundingSide: number = 0;
    private textureSquareTileBoundingSide: number = 0;

    //#endregion Texture tile info

    public tileSide: number = 0;
    private lockHeight: number = 0;
    private octagonBoundingSide: number = 0;
    public octagonTileBoundingSide: number = 0;
    public rotatedOctagonTileBoundingSide: number = 0;
    public squareTileBoundingSide: number = 0;

    constructor(textureModel: TilingTextureModel,
        textureMinSideOctagonTileCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(textureModel, imageContainerModel, renderer);
        this.textureMinSideOctagonTileCount
            = textureMinSideOctagonTileCount
                < OctagonAndSquareWithSpiralLockTilingModel.textureMinSideMinOctagonTileCount
                ? OctagonAndSquareWithSpiralLockTilingModel.textureMinSideMinOctagonTileCount
                : Math.floor(textureMinSideOctagonTileCount);
    }

    public getTilingType(): TilingType {
        return OctagonAndSquareWithSpiralLockTilingModel.tilingType;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToSideRatios[OctagonAndSquareWithSpiralLockTilingModel.lockType];
    }

    protected initializeTextureTileInfo(): void {
        const sqrt2 = Math.sqrt(2);
        const sqrt2PlusOne = sqrt2 + 1;
        const lockHeightToSideRatio = this.getLockHeightToSideRatio();
        this.textureTileSide = this.textureModel.minSide
            / (this.textureMinSideOctagonTileCount * sqrt2PlusOne + 2 * lockHeightToSideRatio);
        this.textureLockHeight = this.textureTileSide * lockHeightToSideRatio;

        if (this.textureModel.widthToHeightRatio <= 1) {
            this.textureTileColumnCount = this.textureMinSideOctagonTileCount;
            this.textureTileRowCount = 2 * Math.trunc(
                (this.textureModel.height - 2 * this.textureLockHeight)
                / this.textureTileSide / sqrt2PlusOne) - 1;
        } else {
            this.textureTileColumnCount = Math.trunc(
                (this.textureModel.width - 2 * this.textureLockHeight)
                / this.textureTileSide / sqrt2PlusOne);
            this.textureTileRowCount = 2 * this.textureMinSideOctagonTileCount - 1;
        }

        this.textureRotatedOctagonTileBoundingSide = this.textureTileSide * sqrt2PlusOne;
        this.textureOctagonTileBoundingSide = this.textureRotatedOctagonTileBoundingSide
            + 2 * this.textureLockHeight;
        this.textureSquareTileBoundingSide = sqrt2 * this.textureTileSide;

        this.textureXTilingOffset = (this.textureModel.width
            - this.textureRotatedOctagonTileBoundingSide * this.textureTileColumnCount
            - 2 * this.textureLockHeight) / 2.0;
        this.textureYTilingOffset = (this.textureModel.height
            - this.textureRotatedOctagonTileBoundingSide * (this.textureTileRowCount / 2.0 + 0.5)
            - 2 * this.textureLockHeight)
            / 2.0;
    }

    protected initializeImageTileInfo(): void {
        this.tileSide = this.textureTileSide * this.imageContainerModel.sideToTextureSideRatio;
        this.lockHeight = this.textureLockHeight * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonTileBoundingSide = this.textureOctagonTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
        this.rotatedOctagonTileBoundingSide = this.textureRotatedOctagonTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
        this.octagonBoundingSide = this.rotatedOctagonTileBoundingSide;
        this.squareTileBoundingSide = this.textureSquareTileBoundingSide
            * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.textureTileRowCount
            && columnIndex >= 0
            && columnIndex < this.textureTileColumnCount - (rowIndex % 2);
    }

    protected getTileModelWithoutTexture(rowIndex: number, columnIndex: number)
            : RegularPolygonWithSingleLockTileModel {
            
        const result = new RegularPolygonWithSingleLockTileModel();
        result.position = new RectangularGridTilePosition(rowIndex, columnIndex);
        result.side = this.tileSide;
        const sqrt2 = Math.sqrt(2);

        if (rowIndex % 2 == 0) {
            result.tileType = TileType.OctagonWithSingleLock;
            if ((rowIndex / 2 + columnIndex) % 2 == 0) {
                result.rotationAngle = 0;
                result.absoluteBoundingRectangle = new Rectangle(
                    columnIndex * this.octagonBoundingSide,
                    rowIndex / 2.0 * this.octagonBoundingSide,
                    this.octagonTileBoundingSide,
                    this.octagonTileBoundingSide
                );
            } else {
                result.rotationAngle = Math.PI / 4;
                result.absoluteBoundingRectangle = new Rectangle(
                    columnIndex * this.octagonBoundingSide + this.lockHeight,
                    rowIndex / 2.0 * this.octagonBoundingSide + this.lockHeight,
                    this.rotatedOctagonTileBoundingSide,
                    this.rotatedOctagonTileBoundingSide
                );
            }
            result.rotatingBoundingRectangleSize = new Size(this.octagonTileBoundingSide,
                this.octagonTileBoundingSide);

            result.hitAreaSideCount = 8;
            result.hitAreaCircumscribedCircleRadius = this.tileSide / Math.sqrt(2 - sqrt2);
            result.hitAreaInitialRotationAngle = 3 / 8.0 * Math.PI;
        } else {
            result.tileType = TileType.SquareWithSingleLock;
            result.rotationAngle = ((rowIndex - 1) / 2 + columnIndex) % 2 == 0
                ? 7.0 / 4.0 * Math.PI
                : Math.PI / 4;
            const offset = this.tileSide + this.squareTileBoundingSide / 2.0 + this.lockHeight;
            result.absoluteBoundingRectangle = new Rectangle(
                this.octagonBoundingSide * columnIndex + offset,
                this.octagonBoundingSide * (rowIndex - 1) / 2.0 + offset + 0.5,
                this.squareTileBoundingSide,
                this.squareTileBoundingSide
            );
            result.rotatingBoundingRectangleSize = new Size(this.tileSide,
                this.tileSide + 2 * this.lockHeight);

            result.hitAreaSideCount = 4;
            result.hitAreaCircumscribedCircleRadius = sqrt2 / 2.0 * this.tileSide;
            result.hitAreaInitialRotationAngle = 0;
        }

        result.pivotPoint = new Point(result.rotatingBoundingRectangleSize.width / 2.0,
            result.rotatingBoundingRectangleSize.height / 2.0);
        result.centerPoint = new Point(
            result.absoluteBoundingRectangle.x + result.absoluteBoundingRectangle.width / 2.0,
            result.absoluteBoundingRectangle.y + result.absoluteBoundingRectangle.height / 2.0);
        return result;
    }
}