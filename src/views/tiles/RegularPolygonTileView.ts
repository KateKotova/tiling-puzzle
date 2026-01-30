import { Color, Container, Graphics, Renderer, Sprite } from "pixi.js";
import { TileView } from "./TileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";

export class RegularPolygonTileView extends TileView {
    constructor (model: TileModel) {
        if (!(model instanceof RegularPolygonTileModel)) {
            throw new Error("The tile is not an instance of RegularPolygonTileModel");
        }
        super(model);
    }

    public getContainer(renderer: Renderer, replacingTextureFillColor: Color): Container {
        const model = this.model as RegularPolygonTileModel;
        const graphics = new Graphics()
            .regularPoly(
                model.absoluteBoundingRectangle.width / 2.0,
                model.absoluteBoundingRectangle.height / 2.0,
                model.circumscribedCircleRadius,
                model.sideCount,
                model.regularPolygonInitialRotationAngle
            );

        if (this.model.texture) {
            graphics.fill({
                texture: this.model.texture,
                textureSpace: "local"
            });
        } else {
            graphics.fill({
                color: replacingTextureFillColor,
                alpha: 1
            });
        }

        const graphicsTexture = renderer.generateTexture({
            target: graphics,
            resolution: 2,
            antialias: true,
            textureSourceOptions: {
                scaleMode: 'linear'
            }
        });

        const result = new Sprite(graphicsTexture);
        return result;
    }
}