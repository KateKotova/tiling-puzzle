import { Graphics } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { TriangleTilingModel } from "../../models/polygons/tilings/TriangleTilingModel.ts";

export class TriangleTilingView extends TilingView {
    constructor(model: TriangleTilingModel) {
        super(model);
    }

    public setExampleTiling(): void {
        const model = this.model as TriangleTilingModel;
        for (let rowIndex = 0; rowIndex < model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.textureTileColumnCount;
                columnIndex++) {

                const shouldFillByTexture = rowIndex == columnIndex
                    || rowIndex == columnIndex - 3
                    || rowIndex == columnIndex + 3;
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