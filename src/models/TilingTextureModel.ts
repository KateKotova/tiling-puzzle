import { Texture } from "pixi.js";

/**
 * Класс модели текстуры для замощения
 */
export class TilingTextureModel {
    public readonly texture: Texture;
    public readonly width: number;
    public readonly height: number;
    public readonly widthToHeightRatio: number;
    public readonly minSide: number;

    constructor(texture: Texture) {
        this.texture = texture;
        this.width = this.texture.width;
        this.height = this.texture.height;
        this.widthToHeightRatio = this.width / this.height;
        this.minSide = Math.min(this.width, this.height);
    }
}