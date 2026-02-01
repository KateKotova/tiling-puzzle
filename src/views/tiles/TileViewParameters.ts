import { Renderer, Ticker, Color, Texture, Container } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { DraggingTileData } from "./DraggingTileData.ts";

export interface TileViewParameters {
    viewSettings: ViewSettings;
    model: TileModel;
    texture: Texture | null;
    renderer: Renderer;
    ticker: Ticker;
    replacingTextureFillColor: Color;
    selectedTileContainer: Container;
    draggingTileData: DraggingTileData;
}