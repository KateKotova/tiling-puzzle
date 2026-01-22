import { TilingTextureModel } from "./TilingTextureModel.ts";

export class ImageContainerModel {
    public width: number;
    public height: number;
    public sideToTextureSideRatio: number;

    constructor(textureModel: TilingTextureModel,
        parentContainerWidth: number,
        parentContainerHeight: number) {

        this.width = parentContainerWidth;
        this.height = this.width / textureModel.widthToHeightRatio;

        if (this.height > parentContainerHeight) {
            this.height = parentContainerHeight;
            this.width = this.height * textureModel.widthToHeightRatio;
        }

        this.sideToTextureSideRatio = this.width / textureModel.width;
    }
}