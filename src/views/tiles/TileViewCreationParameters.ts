import { Renderer, Color, Texture } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";

/**
 * Интерфейс параметров для создания представления элемента замощения
 */
export interface TileViewCreationParameters {
    model: TileModel;
    texture?: Texture;
    renderer: Renderer;
    /**
     * Цвет заливки, применяемый в отсутствии текстуры
     */
    replacingTextureFillColor: Color;
    /**
     * Статический элемент замощения следует кэшировать как текстуру,
     * чтобы он определялся как потенциальная целевая ячейка
     * при движении перетаскиваемой фигуры.
     * Перетаскиваемый элемент замощения не следует кэшировать как текстуру,
     * чтобы при перетаскивании не обрезались выступающие элементы,
     * выходящие за пределы hitArea.
     */
    shouldCacheTileAsTexture: boolean;
}