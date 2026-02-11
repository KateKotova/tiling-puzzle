import { Texture } from "pixi.js";
import { TileModel } from "../tiles/TileModel.ts";
import { TilingContainerModel } from "../TilingContainerModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { TilingType } from "./TilingType.ts";
import { ModelSettings } from "../ModelSettings.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TileLockType } from "../tiles/TileLockType.ts";
import { TileLockHeightToSideRatios } from "../tiles/TileLockHeightToSideRatios.ts";

export abstract class TilingModel {
    public static readonly tilingType: TilingType = TilingType.Unknown;
    public static readonly lockType: TileLockType = TileLockType.None;
    
    protected modelSettings: ModelSettings;
    public isInitialized: boolean = false;
    public textureModel: TilingTextureModel;
    public tilingContainerModel: TilingContainerModel | undefined;
    protected imageContainerModel: ImageContainerModel;

    //#region Texture tile info

    protected textureXTilingOffset: number = 0;
    protected textureYTilingOffset: number = 0;

    //#endregion Texture tile info

    constructor(modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel) {

        this.modelSettings = modelSettings;
        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
    }

    public getTilingType(): TilingType {
        return TilingModel.tilingType;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToSideRatios[TilingModel.lockType];
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

    public abstract getTileModel(rowIndex: number, columnIndex: number): TileModel | undefined;
}