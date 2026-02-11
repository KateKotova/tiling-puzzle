import {
    BlurFilter,
    Color,
    Container,
    Graphics,
    GraphicsPath,
    Renderer,
    Sprite,
    Texture
} from "pixi.js";
import { BaseTileView } from "./BaseTileView.ts";
import { TileViewParameters } from "./TileViewParameters.ts";
import { Size } from "../../math/Size.ts";

/**
 * Представление элемента замощения, который представляет собой svg-путь
 */
export class SvgPathTileView extends BaseTileView {
    private spriteBoundingSize: Size = new Size();

    constructor (parameters: TileViewParameters) {
        if (!parameters.model.geometry.svgPath) {
            throw new Error("The tile has no svg path");
        }
        super(parameters);
    }

    protected createContent(renderer: Renderer, replacingTextureFillColor: Color): Container {
        this.spriteBoundingSize = this.model.geometry.defaultBoundingRectangleSize.clone();

        const graphicsPath = new GraphicsPath(this.model.geometry.svgPath);
        const graphicsTexture = this.getGraphicsTexture(renderer, graphicsPath,
            replacingTextureFillColor);

        const sprite = new Sprite(graphicsTexture);
        // +0.5 - чтобы избежать зазоров
        sprite.width = this.spriteBoundingSize.width + 0.5;
        // +0.5 - чтобы избежать зазоров
        sprite.height = this.spriteBoundingSize.height + 0.5;
        sprite.roundPixels = false;

        const result = new Container();        
        result.addChild(sprite);
        
        const blurredSpriteWithMask = this.getBlurredSpriteWithMask(renderer, graphicsPath,
            graphicsTexture, sprite.width, sprite.height);
        result.addChild(blurredSpriteWithMask);
        
        result.cacheAsTexture({ resolution: this.viewSettings.cacheTileAsTextureResolution });

        result.hitArea = this.model.geometry.hitArea.clone();

        return result;
    }

    private getBlurredSpriteWithMask(
        renderer: Renderer,
        graphicsPath: GraphicsPath,
        graphicsTexture: Texture,
        spriteWidth: number,
        spriteHeight: number
    ): Sprite {
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
            resolution: this.viewSettings.generateTileTextureResolution,
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
        maskSprite.position.set((result.width - maskSprite.width) / 2.0,
            (result.height - maskSprite.height) / 2.0);
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

        const graphicsSideToSpriteSideRatio = graphics.width / this.spriteBoundingSize.width;
        const bevelFilter = this.getBevelFilter(graphicsSideToSpriteSideRatio);
        graphics.filters = [bevelFilter];

        const textureWidth = this.getPowerOfTwoSize(this.spriteBoundingSize.width);
        const textureHeight = this.getPowerOfTwoSize(this.spriteBoundingSize.height);

        const result =  renderer.generateTexture({
            target: graphics,
            resolution: this.viewSettings.generateTileTextureResolution,
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