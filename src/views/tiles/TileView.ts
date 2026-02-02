import { Texture, Container, Filter } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";

export interface TileView {
    model: TileModel;
    texture: Texture | null;
    tile: Container;
    content: Container;
    setFilter: (filter: Filter) => void;
    removeFilters: () => void;
    destroy: () => void;
}