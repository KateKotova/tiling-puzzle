import {
    BlurFilter,
    Color,
    Container,
    Graphics,
    GraphicsPath,
    Point,
    Renderer,
    RenderLayer,
    Sprite,
    Texture,
    Ticker
} from "pixi.js";
import { TileView } from "./TileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";
import { Size } from "../../models/geometry/Size.ts";
import { RegularPolygonWithSingleLockTileModel } from "../../models/polygons/tiles/RegularPolygonWithSingleLockTileModel.ts";
import { AdditionalMath } from "../../models/geometry/AdditionalMath.ts";
import { ViewSettings } from "../ViewSettings.ts";

export class SvgPathTileView extends TileView {
    private spriteBoundingSize: Size = new Size();

    constructor (
        viewSettings: ViewSettings,
        model: TileModel,
        renderer: Renderer,
        ticker: Ticker,
        replacingTextureFillColor: Color,
        selectedTileLayer: RenderLayer) {

        if (model instanceof RegularPolygonTileModel) {
            throw new Error("The tile must not be an instance of RegularPolygonTileModel");
        }
        super(viewSettings, model, renderer, ticker, replacingTextureFillColor, selectedTileLayer);
    }

   protected createContent(renderer: Renderer, replacingTextureFillColor: Color): Container {
        const svgData = this.model.getSvgData();
        if (!svgData) {
            throw new Error("The svg data of the tile should not be null");
        }

        this.spriteBoundingSize = new Size(
            this.model.rotatingBoundingRectangleSize.width + 0.5,
            this.model.rotatingBoundingRectangleSize.height + 0.5
        );

        const graphicsPath = new GraphicsPath(svgData.path);
        const graphicsTexture = this.getGraphicsTexture(renderer, graphicsPath,
            replacingTextureFillColor);

        const sprite = new Sprite(graphicsTexture);
        sprite.width = this.spriteBoundingSize.width;
        sprite.height = this.spriteBoundingSize.height;
        sprite.roundPixels = false;

        const result = new Container();        
        result.addChild(sprite);
        
        const bluredSpriteWithMask = this.getBluredSpriteWithMask(renderer, graphicsPath,
            graphicsTexture, sprite.width, sprite.height);
        result.addChild(bluredSpriteWithMask);
        
        result.cacheAsTexture({ resolution: this.viewSettings.tileTextureResolution });

        if (this.model instanceof RegularPolygonWithSingleLockTileModel) {
            const hitAreaCenterPoint = new Point(
                this.model.rotatingBoundingRectangleSize.width / 2.0,
                this.model.rotatingBoundingRectangleSize.height / 2.0);
            const model = this.model as RegularPolygonWithSingleLockTileModel;            
            result.hitArea = AdditionalMath.getRegularPolygon(hitAreaCenterPoint,
                model.hitAreaCircumscribedCircleRadius, model.hitAreaSideCount,
                model.hitAreaInitialRotationAngle);
        }

        return result;
    }

    private getBluredSpriteWithMask(renderer: Renderer,
        graphicsPath: GraphicsPath,
        graphicsTexture: Texture,
        spriteWidth: number,
        spriteHeight: number): Sprite {

        const maskGraphics = new Graphics()
            .path(graphicsPath)
            .fill({
                color: 0x000000,
                alpha: 1
            });

        const spriteSideToGraphicsSideRatio = this.spriteBoundingSize.width
            / maskGraphics.width;
        const resultStrokeWidth = 1;

        maskGraphics.stroke({ 
            width: Math.trunc(resultStrokeWidth / spriteSideToGraphicsSideRatio),
            color: 0xFFFFFF, 
            alpha: 1,
            alignment: 0.5 
        });

        const maskTexture = renderer.generateTexture({
            target: maskGraphics,
            resolution: this.viewSettings.tileTextureResolution,
            width: spriteWidth,
            height: spriteHeight,
            textureSourceOptions: {
                scaleMode: "linear"
            }
        });
        maskGraphics.destroy();
        
        const result = new Sprite(graphicsTexture);
        result.roundPixels = false;

        const blurFilter = new BlurFilter({ 
            strength: 8.0,
            quality: 5,
            kernelSize: 5
        });
        result.filters = [blurFilter];

        const maskSprite = new Sprite(maskTexture);
        maskSprite.roundPixels = false;
        result.addChild(maskSprite);
        maskSprite.position.set(
            (result.width - maskSprite.width) / 2.0,
            (result.height - maskSprite.height) / 2.0
        );
        result.mask = maskSprite;

        result.width = spriteWidth;
        result.height = spriteHeight;

        return result;
    }

    private getGraphicsTexture(renderer: Renderer,
        graphicsPath: GraphicsPath,
        replacingTextureFillColor: Color): Texture {

        const graphics = new Graphics();
        graphics.roundPixels = false;
        graphics.path(graphicsPath);
        
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

        const graphicsSideToSpriteSideRatio = graphics.width / this.spriteBoundingSize.width;
        const bevelFilter = this.getBevelFilter(graphicsSideToSpriteSideRatio);
        graphics.filters = [bevelFilter];

        const textureWidth = this.getPowerOfTwoSize(this.spriteBoundingSize.width);
        const textureHeight = this.getPowerOfTwoSize(this.spriteBoundingSize.height);

        const result =  renderer.generateTexture({
            target: graphics,
            resolution: this.viewSettings.tileTextureResolution,
            width: textureWidth,
            height: textureHeight,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });
        graphics.destroy();

        return result;
    }

    private getPowerOfTwoSize(size: number): number {
        return Math.pow(2, Math.ceil(Math.log2(size)));
    };
}