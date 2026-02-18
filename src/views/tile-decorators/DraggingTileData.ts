import { DraggableTileView } from "./DraggableTileView";
import { ViewportContainer } from "../ViewportContainer.ts";

/**
 * Интерфейс информация о фигуре, которая перетаскивается в данный момент.
 * Такой объект должен быть один на всех.
 */
export interface DraggingTileData {
    view: DraggableTileView | null;
    viewport: ViewportContainer;
}