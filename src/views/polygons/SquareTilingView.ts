import { Graphics } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { SquareTilingModel } from "../../models/polygons/tilings/SquareTilingModel.ts";

export class SquareTilingView extends TilingView {
    constructor(model: SquareTilingModel) {
        super(model);
    }

    public setExampleTiling(): void {
        const model = this.model as SquareTilingModel;
        for (let rowIndex = 0; rowIndex < model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.textureTileColumnCount;
                columnIndex++) {

                const shouldFillByTexture = rowIndex == columnIndex;
                const tileModel = model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);
                const tile = new Graphics(this.getRegularPolygonTileGraphicsContext(tileModel));

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