import { DraggableTileView } from "./DraggableTileView";

/**
 * Интерфейс информация о фигуре, которая перетаскивается в данный момент.
 * Такой объект должен быть один на всех.
 */
export interface DraggingTileData {
    view: DraggableTileView | null;
}