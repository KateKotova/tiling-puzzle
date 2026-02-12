import { Texture, Container, Filter } from "pixi.js";
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
     * Установка единственного фильтра
     * @param filter Фильтр
     * @returns 
     */
    setFilter: (filter: Filter) => void;
    /**
     * Удаление всех фильтров, подразумевается удаление единственного установленного фильтра
     * @returns 
     */
    removeFilters: () => void;

    createContent: (shouldAddBevelFilter: boolean) => Container;
    replaceContent: (newContent: Container) => void;

    destroy: () => void;
}