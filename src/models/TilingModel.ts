import { TilingContainerModel } from "./TilingContainerModel";
import { TilingTextureModel } from "./TilingTextureModel";
import { TilingType } from "./TilingType";

export interface TilingModel {
    textureModel: TilingTextureModel;
    tilingContainerModel: TilingContainerModel;
    getTilingType(): TilingType;
}