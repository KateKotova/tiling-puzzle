import { Graphics } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { HexagonTilingModel } from "../../models/polygons/tilings/HexagonTilingModel.ts";

export class HexagonTilingView extends TilingView {
    constructor(model: HexagonTilingModel) {
        super(model);
    }

    public setExampleTiling(): void {
        const model = this.model as HexagonTilingModel;
        for (let rowIndex = 0; rowIndex < model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < model.textureTileColumnCount;
                columnIndex++) {

                const shouldFillByTexture = rowIndex == columnIndex
                    || rowIndex == columnIndex - 3
                    || rowIndex == columnIndex + 3;
                const tileModel = model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);

                const tile = new Graphics()
                    .regularPoly(
                        tileModel.centerPoint.x,
                        tileModel.centerPoint.y,
                        tileModel.circumscribedCircleRadius,
                        6,
                        Math.PI / 2
                    )
                    .stroke({
                        color: "black",
                        width: 2,
                        alpha: 0.7
                    });

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