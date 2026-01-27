import { Point, Rectangle, Texture } from "pixi.js";
import { TilePosition } from "./TilePosition.ts";
import { TileType } from "./TileType.ts";
import { TileLockType } from "./TileLockType.ts";
import { TileSvgPathStrings } from "./TileSvgPathStrings.ts";
import { TileLockHeightToSideRatios } from "./TileLockHeightToSideRatios.ts";

export abstract class TileModel {
    public tileType: TileType = TileType.Unknown;
    public tileLockType: TileLockType = TileLockType.Unknown;
    public texture: Texture | undefined;
    public centerPoint: Point = new Point();
    public rotationAngle: number = 0;
    public boundingRectangle: Rectangle = new Rectangle();
    public position: TilePosition = new TilePosition();

    public getSvgPathString(): string {
        return TileSvgPathStrings[this.tileType];
    }

    public getLockHeightToSideRatios(): number {
        return TileLockHeightToSideRatios[this.tileLockType];
    }
}