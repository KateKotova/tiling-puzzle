import { TilingType } from "../../models/TilingType.ts";
import { TilingModel } from "../../models/TilingModel.ts";
import { TilingView } from "./TilingView";
import { SquareTilingView } from "./SquareTilingView";
import { SquareTilingModel } from "../../models/polygons/tilings/SquareTilingModel.ts";
import { TriangleTilingView } from "./TriangleTilingView";
import { TriangleTilingModel } from "../../models/polygons/tilings/TriangleTilingModel";

export class TilingViewFactory {
    public createTilingView(tilingModel: TilingModel): TilingView | null {
        switch (tilingModel.getTilingType()) {
            case TilingType.Square:
                return new SquareTilingView(tilingModel as SquareTilingModel);
            case TilingType.Triangle:
                return new TriangleTilingView(tilingModel as TriangleTilingModel);
            default:
                return null;
        }
    }
}