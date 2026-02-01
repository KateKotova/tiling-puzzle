import { Renderer, Ticker, Color, RenderLayer, Texture } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";

export interface TileViewParameters {
    viewSettings: ViewSettings;
    model: TileModel;
    texture: Texture | null;
    renderer: Renderer;
    ticker: Ticker;
    replacingTextureFillColor: Color;
    selectedTileLayer: RenderLayer;
}