import { Color, Container, Graphics, Point, Renderer, Sprite } from "pixi.js";
import { BaseTileView } from "./BaseTileView.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { AdditionalMath } from "../../models/math/AdditionalMath.ts";
import { TileViewParameters } from "./TileViewParameters.ts";

export class RegularPolygonTileView extends BaseTileView {
    constructor (parameters: TileViewParameters) {
        if (!(parameters.model instanceof RegularPolygonTileModel)) {
            throw new Error("The tile is not an instance of RegularPolygonTileModel");
        }
        super(parameters);
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

        if (this.texture) {
            graphics.fill({
                texture: this.texture,
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

        const sprite = new Sprite(graphicsTexture);
        sprite.cacheAsTexture({ resolution: this.viewSettings.tileTextureResolution });

        const result = new Container();        
        result.addChild(sprite);        
        result.cacheAsTexture({ resolution: this.viewSettings.tileTextureResolution });

        const hitAreaCenterPoint = new Point(model.rotatingBoundingRectangleSize.width / 2.0,
            model.rotatingBoundingRectangleSize.height / 2.0);
        result.hitArea = AdditionalMath.getRegularPolygon(hitAreaCenterPoint,
            model.circumscribedCircleRadius, model.sideCount,
            model.regularPolygonInitialRotationAngle);

        return result;
    }
}