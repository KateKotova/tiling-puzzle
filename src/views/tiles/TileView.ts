import { Color, Container, Renderer } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { BevelFilter } from "pixi-filters";

export abstract class TileView {
    public static readonly textureResolution: number = 2;
    public model: TileModel;
    
    constructor (model: TileModel) {
        this.model = model;
    }

    public abstract getContainer(renderer: Renderer, replacingTextureFillColor: Color): Container;

    protected getBevelFilter(graphicsSideToSpriteSideRatio: number): BevelFilter {
        return new BevelFilter({ 
            rotation: 45
                + (this.model.texture ? 0 : 180)
                - this.model.rotationAngle * 180 / Math.PI,
            thickness: 1.8 * graphicsSideToSpriteSideRatio,
            lightColor: 0xFFFFFF,
            lightAlpha: 0.5,
            shadowColor: 0x000000,
            shadowAlpha: 0.5
        });
    }
}