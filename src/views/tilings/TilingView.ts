import { Container, Renderer } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";

export abstract class TilingView {
    public model: TilingModel;
    public tilingContainer: Container;

    constructor(model: TilingModel) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }
        this.model = model;
        this.tilingContainer = this.createTilingContainer();
    }

    private createTilingContainer(): Container {
        const rectangle = this.model.tilingContainerModel!.boundingRectangle;
        return new Container({
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        });
    }

    public abstract setExampleTiling(renderer: Renderer): void;
}