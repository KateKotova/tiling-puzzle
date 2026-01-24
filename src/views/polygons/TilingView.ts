import { Container } from "pixi.js";
import { TilingModel } from "../../models/TilingModel";

export interface TilingView {
    model: TilingModel;
    tilingContainer: Container;
    setExampleTiling(): void;
}