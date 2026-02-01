import { Color, Renderer, RenderLayer, Ticker } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileType } from "../../models/tiles/TileType.ts";
import { RegularPolygonTileView } from "./RegularPolygonTileView.ts";
import { SvgPathTileView } from "./SvgPathTileView.ts";
import { TileView } from "./TileView.ts";
import { ViewSettings } from "../ViewSettings.ts";

export class TileViewFactory {
    public getView(
        viewSettings: ViewSettings,
        model: TileModel,
        renderer: Renderer,
        ticker: Ticker,
        replacingTextureFillColor: Color,
        selectedTileLayer: RenderLayer): TileView {

        return model.tileType == TileType.RegularPolygon
            ? new RegularPolygonTileView(
                viewSettings,
                model,
                renderer,
                ticker,
                replacingTextureFillColor,
                selectedTileLayer)
            : new SvgPathTileView(
                viewSettings,
                model,
                renderer,
                ticker,
                replacingTextureFillColor,
                selectedTileLayer);
    }
}