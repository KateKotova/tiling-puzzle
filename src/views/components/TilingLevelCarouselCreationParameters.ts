import { Container, Renderer, Ticker } from "pixi.js";
import { TilingView } from "../tilings/TilingView.ts";

/**
 * Интерфейс параметров создания контейнера карусели линии,
 * в которой содержатся элементы мозаики для сборки
 * и которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export interface TilingLevelCarouselCreationParameters {
    renderer: Renderer;
    ticker: Ticker;
    selectedTileContainer: Container;
    tilingView: TilingView;
}