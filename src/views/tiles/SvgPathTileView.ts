import {
    BlurFilter,
    Container,
    Graphics,
    GraphicsPath,
    Renderer,
    Sprite,
    Texture
} from "pixi.js";
import { BevelFilter } from "pixi-filters";
import { TileBaseView } from "./TileBaseView.ts";
import { TileViewCreationParameters } from "./TileViewCreationParameters.ts";
import { Size } from "../../math/Size.ts";
import { TileParameters } from "./TileParameters.ts";

/**
 * Представление элемента замощения, который представляет собой svg-путь
 */
export class SvgPathTileView extends TileBaseView {
    private spriteBoundingSize: Size = new Size();

    constructor (
        parameters: TileParameters,
        creationParameters: TileViewCreationParameters
    ) {
        if (!creationParameters.model.geometry.svgPath) {
            throw new Error("The tile has no svg path");
        }
        super(parameters, creationParameters);
    }

    public createContent(shouldAddBevelFilter: boolean): Container {
        this.spriteBoundingSize = this.model.geometry.defaultBoundingRectangleSize.clone();

        const graphicsPath = new GraphicsPath(this.model.geometry.svgPath);
        const graphicsTexture = this.getGraphicsTexture(graphicsPath, shouldAddBevelFilter);

        const sprite = new Sprite(graphicsTexture);
        sprite.roundPixels = false;

        const result = new Container();        
        result.addChild(sprite);
        
        const borderBlurredSpriteWithMask = this.getBlurredSpriteWithMask(
            this.renderer,
            graphicsPath,
            graphicsTexture,
            sprite.width,
            sprite.height,
            1,
            0.5
        );
        result.addChild(borderBlurredSpriteWithMask);

        if (shouldAddBevelFilter) {
            const innerBlurredSpriteWithMask = this.getBlurredSpriteWithMask(
                this.renderer,
                graphicsPath,
                graphicsTexture,
                sprite.width,
                sprite.height,
                2,
                1
            );
            result.addChild(innerBlurredSpriteWithMask);
        }

        // -0.5 - чтобы избежать зазоров
        result.width = this.spriteBoundingSize.width - 0.5;
        // -0.5 - чтобы избежать зазоров
        result.height = this.spriteBoundingSize.height - 0.5;

        result.cacheAsTexture({ resolution: this.parameters.cacheTileAsTextureResolution });

        result.hitArea = this.model.geometry.hitArea.clone();

        return result;
    }

    private getBlurredSpriteWithMask(
        renderer: Renderer,
        graphicsPath: GraphicsPath,
        graphicsTexture: Texture,
        spriteWidth: number,
        spriteHeight: number,
        maskStrokeWidth: number,
        maskStrokeAlignment: number
    ): Container {
        const maskGraphics = new Graphics()
            .path(graphicsPath)
            .fill({
                color: 0x000000,
                alpha: 1
            });

        const scaleX = spriteWidth / this.spriteBoundingSize.width;
        const scaleY = spriteHeight / this.spriteBoundingSize.height;
        
        maskGraphics.scale.set(scaleX, scaleY);
        
        const resultStrokeWidth = maskStrokeWidth;
        const minScale = Math.min(scaleX, scaleY);
        const scaledStrokeWidth = resultStrokeWidth / minScale;

        maskGraphics.stroke({ 
            width: Math.trunc(scaledStrokeWidth),
            color: 0xFFFFFF, 
            alpha: 1,
            alignment: maskStrokeAlignment
        });

        const maskTexture = renderer.generateTexture({
            target: maskGraphics,
            resolution: this.parameters.generateTileTextureResolution,
            width: spriteWidth,
            height: spriteHeight,
            textureSourceOptions: {
                scaleMode: "linear"
            }
        });
        maskGraphics.destroy();

        const result = new Container();
        
        const blurredSprite = new Sprite(graphicsTexture);
        blurredSprite.roundPixels = false;

        const blurFilter = new BlurFilter({ 
            strength: 8.0,
            quality: 5,
            kernelSize: 5
        });
        blurredSprite.filters = [blurFilter];

        blurredSprite.width = spriteWidth;
        blurredSprite.height = spriteHeight;

        const maskSprite = new Sprite(maskTexture);
        maskSprite.roundPixels = false;
        maskSprite.position.set((blurredSprite.width - maskSprite.width) / 2.0,
            (blurredSprite.height - maskSprite.height) / 2.0);
        blurredSprite.mask = maskSprite;

        result.addChild(blurredSprite);
        result.addChild(maskSprite);

        return result;
    }

    private getGraphicsTexture(graphicsPath: GraphicsPath, shouldAddBevelFilter: boolean): Texture {
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
                color: this.replacingTextureFillColor,
                alpha: 1
            });
        }

        let bevelFilter: BevelFilter | undefined;
        if (shouldAddBevelFilter) {
            const graphicsSideToSpriteSideRatio = graphics.width / this.spriteBoundingSize.width;
            bevelFilter = this.getBevelFilter(graphicsSideToSpriteSideRatio);
            graphics.filters = [bevelFilter];
        }

        const textureWidth = this.getPowerOfTwoSize(this.spriteBoundingSize.width);
        const textureHeight = this.getPowerOfTwoSize(this.spriteBoundingSize.height);

        const result = this.renderer.generateTexture({
            target: graphics,
            resolution: this.parameters.generateTileTextureResolution,
            width: textureWidth,
            height: textureHeight,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });
        graphics.filters = null;
        graphics.destroy();
        if (bevelFilter) {
            bevelFilter.destroy();
        }

        return result;
    }

    private getPowerOfTwoSize(size: number): number {
        return Math.pow(2, Math.ceil(Math.log2(size)));
    };
}