import { Rectangle } from "pixi.js";
import { ImageContainerModel } from "./ImageContainerModel.ts";

/**
 * Класс модели контейнера для элементов замощения.
 * Этот контейнер будет являться дочерним для контейнера изображения, куда помещается текстура.
 * Координаты элементов замощения рассчитываются в система координат этого контейнера.
 */
export class TilingContainerModel {
    /**
     * Границы контейнера элементов замощения в пределах контейнера изображения
     */
    public readonly boundingRectangle: Rectangle;

    constructor(
        imageContainerModel: ImageContainerModel,
        textureXTilingOffset: number,
        textureYTilingOffset: number
    ) {
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