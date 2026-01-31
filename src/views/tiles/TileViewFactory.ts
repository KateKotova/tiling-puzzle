import { Color, Renderer, RenderLayer, Ticker } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileType } from "../../models/tiles/TileType.ts";
import { RegularPolygonTileView } from "./RegularPolygonTileView.ts";
import { SvgPathTileView } from "./SvgPathTileView.ts";
import { TileView } from "./TileView.ts";

export class TileViewFactory {
    public getView(model: TileModel,
        renderer: Renderer,
        ticker: Ticker,
        replacingTextureFillColor: Color,
        selectedTileLayer: RenderLayer): TileView {

        return model.tileType == TileType.RegularPolygon
            ? new RegularPolygonTileView(model, renderer, ticker, replacingTextureFillColor,
                selectedTileLayer)
            : new SvgPathTileView(model, renderer, ticker, replacingTextureFillColor,
                selectedTileLayer);
    }
}