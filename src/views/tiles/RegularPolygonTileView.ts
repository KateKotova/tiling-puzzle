import { Container, Graphics, Sprite } from "pixi.js";
import { TileBaseView } from "./TileBaseView.ts";
import { RegularPolygonTileGeometry } from "../../models/tile-geometries/RegularPolygonTileGeometry.ts";
import { TileLockType } from "../../models/tile-locks/TileLockType.ts";
import { TileParameters } from "./TileParameters.ts";
import { TileViewCreationParameters } from "./TileViewCreationParameters.ts";

/**
 * Представление элемента замощения, который представляет собой правильный многоугольник
 */
export class RegularPolygonTileView extends TileBaseView {
    constructor (
        parameters: TileParameters,
        creationParameters: TileViewCreationParameters
    ) {
        if (!(creationParameters.model.geometry instanceof RegularPolygonTileGeometry)) {
            throw new Error("The tile geometry is not an instance of RegularPolygonTileGeometry");
        }
        if (creationParameters.model.geometry.lockType != TileLockType.None) {
            throw new Error("The tile lock type is not None");
        }
        super(parameters, creationParameters);
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
            resolution: this.parameters.generateTileTextureResolution,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });
        graphics.destroy();

        const sprite = new Sprite(graphicsTexture);
        sprite.cacheAsTexture({ resolution: this.parameters.cacheTileAsTextureResolution });

        const result = new Container();        
        result.addChild(sprite);        
        result.cacheAsTexture({ resolution: this.parameters.cacheTileAsTextureResolution });

        result.hitArea = this.model.geometry.hitArea.clone();

        return result;
    }
}