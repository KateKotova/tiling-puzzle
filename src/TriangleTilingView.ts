import { Container, Graphics } from "pixi.js";
import { TriangleTilingModel } from "./TriangleTilingModel.ts";

export class TriangleTilingView {
    public model: TriangleTilingModel;

    constructor(model: TriangleTilingModel) {
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

    public setExampleTiling(tilingContainer: Container): void {
        for (let rowIndex = 0; rowIndex < this.model.textureTileRowCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.model.textureTileColumnCount;
                columnIndex++) {

                const shouldFillByTexture = rowIndex == columnIndex
                    || rowIndex == columnIndex - 3
                    || rowIndex == columnIndex + 3;
                const tileModel = this.model.getTileModel(rowIndex, columnIndex, shouldFillByTexture);

                const tile = new Graphics()
                    .regularPoly(
                        tileModel.centerPoint.x,
                        tileModel.centerPoint.y,
                        tileModel.circumscribedCircleRadius,
                        3,
                        tileModel.rotationAngle
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

                tilingContainer.addChild(tile);
            }
        }
    }
}