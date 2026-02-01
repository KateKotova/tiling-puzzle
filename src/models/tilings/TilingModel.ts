import { Texture } from "pixi.js";
import { TileModel } from "../tiles/TileModel.ts";
import { TilingContainerModel } from "../TilingContainerModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { TilingType } from "./TilingType.ts";

export interface TilingModel {
    textureModel: TilingTextureModel;
    tilingContainerModel: TilingContainerModel | undefined;
    isInitialized: boolean;
    initialize(): void;
    getTilingType(): TilingType;
    getTileTexture(tileModel: TileModel): Texture;
}