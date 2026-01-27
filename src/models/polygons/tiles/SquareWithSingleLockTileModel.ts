import { TileLockType } from "../../tiles/TileLockType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { TileType } from "../../tiles/TileType.ts";

export class SquareWithSingleLockTileModel extends TileModel {
    public tileType: TileType = TileType.SquareWithSingleLock;
    public tileLockType: TileLockType = TileLockType.Single;
    public side: number = 0;
}