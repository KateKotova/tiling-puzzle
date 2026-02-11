import { TilingTextureModel } from "./TilingTextureModel.ts";

/**
 * Класс модели контейнера изображения, куда помещается текстура
 */
export class ImageContainerModel {
    public readonly width: number;
    public readonly height: number;
    /**
     * Отношение ширины контейнера изображения к ширине текстуры
     * или отношение высоты контейнера изображения к высоте текстуры
     */
    public readonly sideToTextureSideRatio: number;

    constructor(
        textureModel: TilingTextureModel,
        parentContainerWidth: number,
        parentContainerHeight: number
    ) {
        this.width = parentContainerWidth;
        this.height = this.width / textureModel.widthToHeightRatio;

        if (this.height > parentContainerHeight) {
            this.height = parentContainerHeight;
            this.width = this.height * textureModel.widthToHeightRatio;
        }

        this.sideToTextureSideRatio = this.width / textureModel.width;
    }
}