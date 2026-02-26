import { DraggableTileView } from "./DraggableTileView";
import { ZoomAndPanContainer } from "../components/ZoomAndPanContainer.ts";
import { TileView } from "../tiles/TileView.ts";

/**
 * Интерфейс информации о фигуре, которая перетаскивается в данный момент.
 */
interface DraggingTileData {
    view?: DraggableTileView;
    viewport?: ZoomAndPanContainer;
    animatingViews: Set<TileView>;
}

/**
 * Модульный объект-singleton информации о фигуре, которая перетаскивается в данный момент.
 */
export const draggingTileData: DraggingTileData = {
    view: undefined,
    viewport: undefined,
    animatingViews: new Set<TileView>()
};