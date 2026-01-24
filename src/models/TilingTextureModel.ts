import { Texture } from "pixi.js";

export class TilingTextureModel {
    public texture: Texture;
    public width: number;
    public height: number;
    public widthToHeightRatio: number;
    public minSide: number;

    constructor(texture: Texture) {
        this.texture = texture;
        this.width = this.texture.width;
        this.height = this.texture.height;
        this.widthToHeightRatio = this.width / this.height;
        this.minSide = Math.min(this.width, this.height);
    }
}