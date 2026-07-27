import { DraggableTileView } from "./DraggableTileView";
import { ZoomAndPanContainer } from "../components/zoom-and-pan/ZoomAndPanContainer.ts";
import { TileView } from "../tiles/TileView.ts";
import { TilingView } from "../tilings/TilingView.ts";

/**
 * Интерфейс информации о фигуре, которая перетаскивается в данный момент.
 */
interface DraggingTileData {
    view?: DraggableTileView;
    viewport?: ZoomAndPanContainer;
    tilingView?: TilingView;
    animatingViews: Set<TileView>;
}

/**
 * Модульный объект-singleton информации о фигуре, которая перетаскивается в данный момент.
 */
export const draggingTileData: DraggingTileData = {
    view: undefined,
    viewport: undefined,
    tilingView: undefined,
    animatingViews: new Set<TileView>()
};