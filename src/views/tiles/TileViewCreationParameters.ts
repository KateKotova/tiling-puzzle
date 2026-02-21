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
}