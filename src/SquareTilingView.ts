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
        for (let rowIndex = 0, y = 0;
            rowIndex < this.model.textureHeightSquareCount;
            rowIndex++, y += this.model.squareSide) {

            for (let columnIndex = 0, x = 0;
                columnIndex < this.model.textureWidthSquareCount;
                columnIndex++, x += this.model.squareSide) {

                const square = new Graphics(squareContext.clone())
                square.position.set(x, y);

                // Протестируем только диагональные элементы
                if (rowIndex == columnIndex) {
                    const squareTexture = this.model.getImageSquareTexture(rowIndex, columnIndex);
                    if (squareTexture) {
                        square.fill({
                            texture: squareTexture,
                            textureSpace: "local"
                        });
                    }
                }

                tilingContainer.addChild(square);
            }
        }
    }
}