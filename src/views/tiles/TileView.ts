import { Color, Container, Renderer } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";

export abstract class TileView {
    public model: TileModel;

    constructor (model: TileModel) {
        this.model = model;
    }

    public abstract getContainer(renderer: Renderer, replacingTextureFillColor: Color): Container;
}