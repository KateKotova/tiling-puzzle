import { Graphics, GraphicsContext } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { SquareTilingModel } from "../../models/polygons/tilings/SquareTilingModel.ts";

export class SquareTilingView extends TilingView {
    constructor(model: SquareTilingModel) {
        super(model);
    }

    private getTileGraphicContext(): GraphicsContext {
        const model = this.model as SquareTilingModel;
        return new GraphicsContext()
            .rect(0, 0, model.tileSide, model.tileSide)
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }

    public setExampleTiling(): void {
        const model = this.model as SquareTilingModel;
        for (let rowIndex = 0; rowIndex < model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.textureTileColumnCount;
                columnIndex++) {

                // Покажем только диагональные элементы
                const shouldFillByTexture = rowIndex == columnIndex;
                const tileModel = model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);

                const tile = new Graphics(this.getTileGraphicContext());
                tile.position.set(tileModel.boundingRectangle.x, tileModel.boundingRectangle.y);

                if (shouldFillByTexture) {
                    tile.fill({
                        texture: tileModel.texture,
                        textureSpace: "local"
                    });
                }

                this.tilingContainer.addChild(tile);
            }
        }
    }
}