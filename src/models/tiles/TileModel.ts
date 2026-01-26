import { Point, Rectangle, Texture } from "pixi.js";
import { TilePosition } from "./TilePosition";

export abstract class TileModel {
    public texture: Texture | undefined;
    public centerPoint: Point = new Point();
    public rotationAngle: number = 0;
    public boundingRectangle: Rectangle = new Rectangle();
    public position: TilePosition = new TilePosition();
}