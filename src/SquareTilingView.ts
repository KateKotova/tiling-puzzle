import { Container, Graphics, GraphicsContext } from "pixi.js";
import { SquareTilingModel } from "./SquareTilingModel.ts";

export class SquareTilingView {
    public model: SquareTilingModel;

    constructor(model: SquareTilingModel) {
        this.model = model;
    }

    public getTilingContainer(): Container {
        return new Container({
            x: this.model.squaresContainerRectangle.x,
            y: this.model.squaresContainerRectangle.y,
            width: this.model.squaresContainerRectangle.width,
            height: this.model.squaresContainerRectangle.height
        });
    }

    public getSquareContext(): GraphicsContext {
        return new GraphicsContext()
            .rect(0, 0, this.model.squareSide, this.model.squareSide)
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }

    public setExampleTiling(tilingContainer: Container, squareContext: GraphicsContext): void {
        for (let rowIndex = 0; rowIndex < this.model.textureHeightSquareCount; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.model.textureWidthSquareCount;
                columnIndex++) {

                // Покажем только диагональные элементы
                const tileModel = this.model.getTileModel(rowIndex, columnIndex,
                    rowIndex == columnIndex);

                const square = new Graphics(squareContext.clone())
                square.position.set(tileModel.boundingRectangle.x, tileModel.boundingRectangle.y);

                if (tileModel.texture) {
                    square.fill({
                        texture: tileModel.texture,
                        textureSpace: "local"
                    });
                }

                tilingContainer.addChild(square);
            }
        }
    }
}