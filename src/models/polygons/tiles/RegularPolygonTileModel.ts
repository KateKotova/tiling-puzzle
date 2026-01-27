import { TileLockType } from "../../tiles/TileLockType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { TileType } from "../../tiles/TileType.ts";

export class RegularPolygonTileModel extends TileModel {
    public tileType: TileType = TileType.RegularPolygon;
    public tileLockType: TileLockType = TileLockType.None;
    public side: number = 0;
    public sideCount: number = 0;
    public circumscribedCircleRadius: number = 0;
    public regularPolygonInitialRotationAngle: number = 0;
}