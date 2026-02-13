import { Graphics, Matrix, Renderer, Texture } from "pixi.js";
import { ModelSettings } from "../ModelSettings.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TileLockType } from "../tile-locks/TileLockType.ts";
import { TilingContainerModel } from "../TilingContainerModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { TilingType } from "./TilingType.ts";
import { TileLockHeightToBaseValueRatios } from "../tile-locks/TileLockHeightToBaseValueRatios.ts";
import { TileModel } from "../tiles/TileModel.ts";

/**
 * Класс модели замощения
 */
export abstract class TilingModel {
    public readonly tilingType: TilingType = TilingType.Unknown;
    public readonly lockType: TileLockType = TileLockType.None;

    protected modelSettings: ModelSettings;
    public isInitialized: boolean = false;
    public textureModel: TilingTextureModel;
    public tilingContainerModel?: TilingContainerModel;
    protected imageContainerModel: ImageContainerModel;
    private renderer: Renderer;

    //#region Texture tile info

    /**
     * Отступ по оси OX для контейнера замощения
     * в масштабе и координатах исходной текстуры
     */
    protected textureXTilingOffset: number = 0;
    /**
     * Отступ по оси OY для контейнера замощения
     * в масштабе и координатах исходной текстуры
     */
    protected textureYTilingOffset: number = 0;

    //#endregion Texture tile info

    constructor(
        modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {
        this.modelSettings = modelSettings;
        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToBaseValueRatios[this.lockType];
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

    public getTileTexture(tileModel: TileModel): Texture {
        if (!this.tilingContainerModel) {
            throw new Error('tilingContainerModel is not initialized');
        }

        const sideToTextureSideRatio = this.imageContainerModel.sideToTextureSideRatio;

        const textureTileLocalPivotPointX = tileModel.geometry.pivotPoint.x
            / sideToTextureSideRatio;
        const textureTileLocalPivotPointY = tileModel.geometry.pivotPoint.y
            / sideToTextureSideRatio;

        const textureTileAbsolutePivotPointX = tileModel.targetPositionPoint.x
            / sideToTextureSideRatio
            + this.textureXTilingOffset;
        const textureTileAbsolutePivotPointY = tileModel.targetPositionPoint.y
            / sideToTextureSideRatio
             + this.textureYTilingOffset;
        
        const textureTileDefaultBoundingRectangleWidth
            = tileModel.geometry.defaultBoundingRectangleSize.width
            / sideToTextureSideRatio;
        const textureTileDefaultBoundingRectangleHeight
            = tileModel.geometry.defaultBoundingRectangleSize.height
            / sideToTextureSideRatio;

        const textureMatrix = new Matrix();
        textureMatrix.setTransform(
            0, 0,
            textureTileAbsolutePivotPointX, textureTileAbsolutePivotPointY,
            1, 1,
            -tileModel.targetRotationAngle,
            0, 0
        );
        const globalTile = new Graphics()
            .rect(
                -textureTileLocalPivotPointX,
                -textureTileLocalPivotPointY,
                textureTileDefaultBoundingRectangleWidth,
                textureTileDefaultBoundingRectangleHeight
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global",
                matrix: textureMatrix
            });

        const result = this.renderer.generateTexture({
            target: globalTile,
            resolution: 1,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });

        globalTile.destroy();
        return result;
    }
}