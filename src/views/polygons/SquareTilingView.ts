import { Container, Graphics, GraphicsContext } from "pixi.js";
import { TilingView } from "./TilingView.ts";
import { SquareTilingModel } from "../../models/polygons/tilings/SquareTilingModel.ts";

export class SquareTilingView implements TilingView {
    public model: SquareTilingModel;
    public tilingContainer: Container;

    constructor(model: SquareTilingModel) {
        this.model = model;
        this.tilingContainer = this.createTilingContainer();
    }

    private createTilingContainer(): Container {
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

    public setExampleTiling(): void {
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

                this.tilingContainer.addChild(tile);
            }
        }
    }
}