import { TileLockType } from "../../tiles/TileLockType.ts";
import { TileModel } from "../../tiles/TileModel.ts";
import { TileType } from "../../tiles/TileType.ts";

export class RegularPolygonWithSingleLockTileModel extends TileModel {
    public tileType: TileType = TileType.Unknown;
    public tileLockType: TileLockType = TileLockType.Single;
    public side: number = 0;
    public hitAreaSideCount: number = 0;
    public hitAreaCircumscribedCircleRadius: number = 0;
    public hitAreaInitialRotationAngle: number = 0;

    public getFreedomDegreeCount(): number {
        return this.getSvgData()!.freedomDegreeCount;
    }
}