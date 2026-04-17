import { Color, Container, Ticker } from "pixi.js";
import { TilingView } from "../../tilings/TilingView.ts";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";
import { TileLineLayoutType } from "./TileLineLayoutType.ts";

/**
 * Интерфейс параметров для создания контейнера линии,
 * в которой содержатся элементы мозаики для сборки
 */
export interface TileLineCreationParameters {
    directionType: TileLineDirectionType;
    layoutType: TileLineLayoutType;
    transverseSize: number;
    tilingView: TilingView;
    selectedTileContainer: Container;
    ticker: Ticker;
    backgroundFillColor?: Color;
}