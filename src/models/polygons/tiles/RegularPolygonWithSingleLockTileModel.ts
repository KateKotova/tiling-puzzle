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

    public clone(): TileModel {
        const result = new RegularPolygonWithSingleLockTileModel(this.modelSettings);
        this.updateClone(result);
        return result;
    }

    protected updateClone(clone: TileModel) {
        super.updateClone(clone);
        const thisClone = clone as RegularPolygonWithSingleLockTileModel;
        thisClone.side = this.side;
        thisClone.hitAreaSideCount = this.hitAreaSideCount;
        thisClone.hitAreaCircumscribedCircleRadius = this.hitAreaCircumscribedCircleRadius;
        thisClone.hitAreaInitialRotationAngle = this.hitAreaInitialRotationAngle;
    }
}