import { Graphics } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";

export abstract class TileView {
    public model: TileModel;

    constructor (model: TileModel) {
        this.model = model;
    }

    public abstract getGraphics(): Graphics;
}