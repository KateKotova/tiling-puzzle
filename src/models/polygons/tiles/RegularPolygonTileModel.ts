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

    public getFreedomDegreeCount(): number {
        return this.sideCount;
    }

    public clone(): TileModel {
        const result = new RegularPolygonTileModel(this.modelSettings);
        this.updateClone(result);
        return result;
    }

    protected updateClone(clone: TileModel) {
        super.updateClone(clone);
        const thisClone = clone as RegularPolygonTileModel;
        thisClone.side = this.side;
        thisClone.sideCount = this.sideCount;
        thisClone.circumscribedCircleRadius = this.circumscribedCircleRadius;
        thisClone.regularPolygonInitialRotationAngle = this.regularPolygonInitialRotationAngle;
    }
}