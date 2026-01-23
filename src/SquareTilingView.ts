import { Container, Graphics, GraphicsContext } from "pixi.js";
import { SquareTilingModel } from "./SquareTilingModel.ts";

export class SquareTilingView {
    public model: SquareTilingModel;

    constructor(model: SquareTilingModel) {
        this.model = model;
    }

    public getTilingContainer(): Container {
        return new Container({
            x: this.model.tilingContainerRectangle.x,
            y: this.model.tilingContainerRectangle.y,
            width: this.model.tilingContainerRectangle.width,
            height: this.model.tilingContainerRectangle.height
        });
    }

    public getTileGraphicContext(): GraphicsContext {
        return new GraphicsContext()
            .rect(0, 0, this.model.tileSide, this.model.tileSide)
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }

    public setExampleTiling(tilingContainer: Container, tileGraphicContext: GraphicsContext): void {
        for (let rowIndex = 0; rowIndex < this.model.textureHeightTileCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.model.textureWidthTileCount;
                columnIndex++) {

                // Покажем только диагональные элементы
                const shouldFillByTexture = rowIndex == columnIndex;
                const tileModel = this.model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);

                const tile = new Graphics(tileGraphicContext.clone())
                tile.position.set(tileModel.boundingRectangle.x, tileModel.boundingRectangle.y);

                if (shouldFillByTexture) {
                    tile.fill({
                        texture: tileModel.texture,
                        textureSpace: "local"
                    });
                }

                tilingContainer.addChild(tile);
            }
        }
    }
}