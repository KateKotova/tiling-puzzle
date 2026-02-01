import { Graphics, Matrix, Renderer, Texture } from "pixi.js";
import { TilingType } from "./TilingType.ts";
import { TilingModel } from "./TilingModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TilingContainerModel } from "../TilingContainerModel.ts";
import { TileModel } from "../tiles/TileModel.ts";
import { TileLockType } from "../tiles/TileLockType.ts";
import { TileLockHeightToSideRatios } from "../tiles/TileLockHeightToSideRatios.ts";

export abstract class RectangularGridTilingModel implements TilingModel {
    public static readonly tilingType: TilingType = TilingType.Unknown;
    public static readonly lockType: TileLockType = TileLockType.None;

    //#region Texture tile info

    public textureModel: TilingTextureModel;
    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;
    protected textureXTilingOffset: number = 0;
    protected textureYTilingOffset: number = 0;

    //#endregion Texture tile info

    public isInitialized: boolean = false;
    protected imageContainerModel: ImageContainerModel;
    public tilingContainerModel: TilingContainerModel | undefined;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;
    }

    public getTilingType(): TilingType {
        return RectangularGridTilingModel.tilingType;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToSideRatios[RectangularGridTilingModel.lockType];
    }

    public initialize(): void {
        this.initializeTextureTileInfo();        
        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);
        this.initializeImageTileInfo();
        this.isInitialized = true;
    }

    protected abstract initializeTextureTileInfo(): void;

    protected abstract initializeImageTileInfo(): void;

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.textureTileRowCount
            && columnIndex >= 0
            && columnIndex < this.textureTileColumnCount;
    }

    protected abstract getProtectedTileModel(rowIndex: number, columnIndex: number): TileModel;

    public getTileModel(rowIndex: number, columnIndex: number): TileModel | undefined {
        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);
        if (!this.getGridIndicesAreCorrect(rowIndex, columnIndex)) {
            return undefined;
        }        
        return this.getProtectedTileModel(rowIndex, columnIndex);
    }

    public getTileTexture(tileModel: TileModel): Texture {
        const sideToTextureSideRatio = this.imageContainerModel.sideToTextureSideRatio;
        const boundingRectangleCenterPointX = (tileModel.absoluteBoundingRectangle.x
            + tileModel.absoluteBoundingRectangle.width / 2.0)
            / sideToTextureSideRatio
            + this.textureXTilingOffset;
        const boundingRectangleCenterPointY = (tileModel.absoluteBoundingRectangle.y
            + tileModel.absoluteBoundingRectangle.height / 2.0)
            / sideToTextureSideRatio
            + this.textureYTilingOffset;
        const rotatingBoundingRectangleWidth = tileModel.rotatingBoundingRectangleSize.width
            / sideToTextureSideRatio;
        const rotatingBoundingRectangleHeight = tileModel.rotatingBoundingRectangleSize.height
            / sideToTextureSideRatio;

        const textureMatrix = new Matrix();
        textureMatrix.setTransform(0, 0,
            boundingRectangleCenterPointX, boundingRectangleCenterPointY,
            1, 1,
            -tileModel.rotationAngle,
            0, 0);
        const globalTile = new Graphics()
            .rect(
                -rotatingBoundingRectangleWidth / 2.0,
                -rotatingBoundingRectangleHeight / 2.0,
                rotatingBoundingRectangleWidth,
                rotatingBoundingRectangleHeight
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global",
                matrix: textureMatrix
            });

        const result = this.renderer.generateTexture(globalTile);
        globalTile.destroy();
        return result;
    }
}