import { TilingType } from "../../models/TilingType.ts";
import { TilingModel } from "../../models/TilingModel.ts";
import { TilingView } from "./TilingView";
import { SquareTilingView } from "./SquareTilingView";
import { SquareTilingModel } from "../../models/polygons/tilings/SquareTilingModel.ts";
import { TriangleTilingView } from "./TriangleTilingView";
import { TriangleTilingModel } from "../../models/polygons/tilings/TriangleTilingModel";
import { HexagonTilingView } from "./HexagonTilingView.ts";
import { HexagonTilingModel } from "../../models/polygons/tilings/HexagonTilingModel.ts";

export class TilingViewFactory {
    public createTilingView(tilingModel: TilingModel): TilingView | null {
        switch (tilingModel.getTilingType()) {
            case TilingType.Square:
                return new SquareTilingView(tilingModel as SquareTilingModel);
            case TilingType.Triangle:
                return new TriangleTilingView(tilingModel as TriangleTilingModel);
            case TilingType.Hexagon:
                return new HexagonTilingView(tilingModel as HexagonTilingModel);
            default:
                return null;
        }
    }
}