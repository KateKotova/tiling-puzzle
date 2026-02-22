import { DraggableTileView } from "./DraggableTileView";
import { ZoomAndPanContainer } from "../components/ZoomAndPanContainer.ts";
import { TileView } from "../tiles/TileView.ts";

/**
 * Интерфейс информация о фигуре, которая перетаскивается в данный момент.
 * Такой объект должен быть один на всех.
 */
export interface DraggingTileData {
    view?: DraggableTileView;
    viewport: ZoomAndPanContainer;
    animatingViews: Set<TileView>;
}