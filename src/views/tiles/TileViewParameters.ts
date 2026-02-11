import { Renderer, Color, Texture } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";

/**
 * Интерфейс параметров для создания представления элемента замощения
 */
export interface TileViewParameters {
    viewSettings: ViewSettings;
    model: TileModel;
    texture?: Texture;
    renderer: Renderer;
    /**
     * Цвет заливки, применяемый в отсутствии текстуры
     */
    replacingTextureFillColor: Color;
}