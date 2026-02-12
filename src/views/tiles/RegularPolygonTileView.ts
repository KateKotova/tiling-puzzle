import { Container, Graphics, Sprite } from "pixi.js";
import { TileViewBase } from "./TileViewBase.ts";
import { TileViewParameters } from "./TileViewParameters.ts";
import { RegularPolygonTileGeometry } from "../../models/tile-geometries/RegularPolygonTileGeometry.ts";
import { TileLockType } from "../../models/tile-locks/TileLockType.ts";

/**
 * Представление элемента замощения, который представляет собой правильный многоугольник
 */
export class RegularPolygonTileView extends TileViewBase {
    constructor (parameters: TileViewParameters) {
        if (!(parameters.model.geometry instanceof RegularPolygonTileGeometry)) {
            throw new Error("The tile geometry is not an instance of RegularPolygonTileGeometry");
        }
        if (parameters.model.geometry.lockType != TileLockType.None) {
            throw new Error("The tile lock type is not None");
        }
        super(parameters);
    }

    public createContent(shouldAddBevelFilter: boolean): Container {
        const geometry = this.model.geometry as RegularPolygonTileGeometry;
        const graphics = new Graphics()
            .regularPoly(
                geometry.pivotPoint.x,
                geometry.pivotPoint.y,
                // +0.5 - чтобы избежать зазоров
                geometry.circumscribedCircleRadius + 0.5,
                geometry.sideCount,
                geometry.regularPolygonInitialRotationAngle
            );

        if (this.texture) {
            graphics.fill({
                texture: this.texture,
                textureSpace: "local"
            });
        } else {
            graphics.fill({
                color: this.replacingTextureFillColor,
                alpha: 1
            });
        }

        if (shouldAddBevelFilter) {
            const graphicsSideToSpriteSideRatio = graphics.width
                / geometry.defaultBoundingRectangleSize.width;
            const bevelFilter = this.getBevelFilter(graphicsSideToSpriteSideRatio);
            graphics.filters = [bevelFilter];
        }

        const graphicsTexture = this.renderer.generateTexture({
            target: graphics,
            resolution: this.viewSettings.generateTileTextureResolution,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });
        graphics.destroy();

        const sprite = new Sprite(graphicsTexture);
        sprite.cacheAsTexture({ resolution: this.viewSettings.cacheTileAsTextureResolution });

        const result = new Container();        
        result.addChild(sprite);        
        result.cacheAsTexture({ resolution: this.viewSettings.cacheTileAsTextureResolution });

        result.hitArea = this.model.geometry.hitArea.clone();

        return result;
    }
}