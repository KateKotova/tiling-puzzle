import { SquareWithSingleLockTilingView } from "../../views/polygons/SquareWithSingleLockTilingView.ts";
import { RegularPolygonTilingView } from "../../views/polygons/RegularPolygonTilingView.ts";
import { RectangularGridTilingView } from "../../views/RectangularGridTilingView.ts";
import { RectangularGridTilingModel } from "../../models/tilings/RectangularGridTilingModel.ts";
import { TilingType } from "../../models/tilings/TilingType.ts";

export class RectangularGridTilingViewFactory {
    public getTilingModel(tilingModel: RectangularGridTilingModel): RectangularGridTilingView {
        const result: RectangularGridTilingView
            = tilingModel.getTilingType() == TilingType.SquareWithSingleLock
            ? new SquareWithSingleLockTilingView(tilingModel)
            : new RegularPolygonTilingView(tilingModel);
        result.setExampleTiling();
        return result;     
    }
}