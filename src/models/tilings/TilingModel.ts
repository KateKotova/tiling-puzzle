import { Texture } from "pixi.js";
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
        imageContainerModel: ImageContainerModel
    ) {
        this.modelSettings = modelSettings;
        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
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

    public abstract getTileTexture(tileModel: TileModel): Texture;
}