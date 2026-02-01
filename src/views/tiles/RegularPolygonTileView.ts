import { Color, Container, Graphics, Point, Renderer, RenderLayer, Sprite, Ticker } from "pixi.js";
import { TileView } from "./TileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { AdditionalMath } from "../../models/geometry/AdditionalMath.ts";
import { ViewSettings } from "../ViewSettings.ts";

export class RegularPolygonTileView extends TileView {
    constructor (
        viewSettings: ViewSettings,
        model: TileModel,
        renderer: Renderer,
        ticker: Ticker,
        replacingTextureFillColor: Color,
        selectedTileLayer: RenderLayer) {

        if (!(model instanceof RegularPolygonTileModel)) {
            throw new Error("The tile is not an instance of RegularPolygonTileModel");
        }
        super(viewSettings, model, renderer, ticker, replacingTextureFillColor, selectedTileLayer);
    }

    protected createContent(renderer: Renderer, replacingTextureFillColor: Color): Container {
        const model = this.model as RegularPolygonTileModel;
        const graphics = new Graphics()
            .regularPoly(
                model.absoluteBoundingRectangle.width / 2.0,
                model.absoluteBoundingRectangle.height / 2.0,
                model.circumscribedCircleRadius,
                model.sideCount,
                model.regularPolygonInitialRotationAngle
            );

        if (model.texture) {
            graphics.fill({
                texture: model.texture,
                textureSpace: "local"
            });
        } else {
            graphics.fill({
                color: replacingTextureFillColor,
                alpha: 1
            });
        }

        const graphicsSideToSpriteSideRatio = graphics.width
            / model.rotatingBoundingRectangleSize.width;
        const bevelFilter = this.getBevelFilter(graphicsSideToSpriteSideRatio);
        graphics.filters = [bevelFilter];

        const graphicsTexture = renderer.generateTexture({
            target: graphics,
            resolution: this.viewSettings.tileTextureResolution,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });
        graphics.destroy();

        const result = new Sprite(graphicsTexture);
        result.cacheAsTexture({ resolution: this.viewSettings.tileTextureResolution });

        const hitAreaCenterPoint = new Point(model.rotatingBoundingRectangleSize.width / 2.0,
            model.rotatingBoundingRectangleSize.height / 2.0);
        result.hitArea = AdditionalMath.getRegularPolygon(hitAreaCenterPoint,
            model.circumscribedCircleRadius, model.sideCount,
            model.regularPolygonInitialRotationAngle);
        return result;
    }
}