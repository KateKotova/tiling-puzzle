import { Point, Rectangle, Texture } from "pixi.js";

export class TriangleTileModel {
    public texture: Texture | undefined;
    public side: number = 0;
    public centerPoint: Point = new Point();
    public circumscribedCircleRadius: number = 0;
    public rotationAngle: number = 0;
    public boundingRectangle: Rectangle = new Rectangle();
}