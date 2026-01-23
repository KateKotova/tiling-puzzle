import { Rectangle } from "pixi.js";
import { ImageContainerModel } from "./ImageContainerModel.ts";

export class TilingContainerModel {
    public boundingRectangle: Rectangle;

    constructor(imageContainerModel: ImageContainerModel,
        textureXTilingOffset: number,
        textureYTilingOffset: number) {

        const tilingContainerXOffset = textureXTilingOffset
            * imageContainerModel.sideToTextureSideRatio;
        const tilingContainerYOffset = textureYTilingOffset
            * imageContainerModel.sideToTextureSideRatio;
    
        this.boundingRectangle = new Rectangle(
            tilingContainerXOffset,
            tilingContainerYOffset,
            imageContainerModel.width - tilingContainerXOffset * 2,
            imageContainerModel.height - tilingContainerYOffset * 2,
        );
    }
}