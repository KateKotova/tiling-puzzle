import { Container, Graphics, GraphicsContext } from "pixi.js";
import { SquareTilingModel } from "./SquareTilingModel.ts";

export class SquareTilingView {
    public model: SquareTilingModel;

    constructor(model: SquareTilingModel) {
        this.model = model;
    }

    public getTilingContainer(): Container {
        const rectangle = this.model.tilingContainerModel.boundingRectangle;
        return new Container({
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        });
    }

    private getTileGraphicContext(): GraphicsContext {
        return new GraphicsContext()
            .rect(0, 0, this.model.tileSide, this.model.tileSide)
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }

    public setExampleTiling(tilingContainer: Container): void {
        for (let rowIndex = 0; rowIndex < this.model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.model.textureTileColumnCount;
                columnIndex++) {

                // Покажем только диагональные элементы
                const shouldFillByTexture = rowIndex == columnIndex;
                const tileModel = this.model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);

                const tile = new Graphics(this.getTileGraphicContext());
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