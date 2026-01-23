import { Rectangle, Texture } from "pixi.js";

export class SquareTileModel {
    public texture: Texture | undefined;
    public side: number = 0;
    public rotationAngle: number = 0;
    public boundingRectangle: Rectangle = new Rectangle();
}