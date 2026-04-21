import { Texture, Container, Filter, Color } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";

/**
 * Интерфейс представления элемента замощения
 */
export interface TileView {
    model: TileModel;
    texture?: Texture;
    /**
     * Контейнер фигуры
     */
    tile: Container;
    /**
     * Содержимое, дочерний элемент контейнера фигуры
     */
    content: Container;
    /**
     * Цвет заливки, применяемый в отсутствии текстуры
     */
    replacingTextureFillColor: Color;

    addFilter: (filter: Filter) => void;
    removeFilter: (filter: Filter) => void;
    clearFilters: () => void;

    createContent: (shouldAddBevelFilter: boolean) => Container;
    replaceContent: (newContent: Container) => void;

    destroy: () => void;
}