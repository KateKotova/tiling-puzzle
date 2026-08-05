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

    constructor(
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

        const borderBlurPadding = 0.5;

        const graphicsPath = new GraphicsPath(this.model.geometry.svgPath);
        const graphicsTexture = this.getGraphicsTexture(graphicsPath, shouldAddBevelFilter,
            borderBlurPadding);

        const sprite = new Sprite(graphicsTexture);
        sprite.roundPixels = false;
        sprite.texture.source.scaleMode = "linear";
        sprite.position.set(0, 0);

        const result = new Container();        
        result.addChild(sprite);
        
        // Размытый край с помощью маски.
        // Выравнивание маски-обводки - по центру края фигуры.
        const maskedBorderBlurredSprite = this.getMaskedBlurredSprite(
            this.renderer,
            graphicsPath,
            graphicsTexture,
            sprite.width,
            sprite.height,
            borderBlurPadding * 2,
            0.5
        );
        result.addChild(maskedBorderBlurredSprite);

        if (shouldAddBevelFilter) {
            // Размытый край с помощью маски.
            // Выравнивание маски-обводки - внутрь от края фигуры.
            const innerMaskedBlurredSprite = this.getMaskedBlurredSprite(
                this.renderer,
                graphicsPath,
                graphicsTexture,
                sprite.width,
                sprite.height,
                (this.parameters.bevelFilterOptions.thickness ?? 2) + 2,
                1
            );
            result.addChild(innerMaskedBlurredSprite);
        }

        // -0.5 - чтобы избежать зазоров
        result.width = this.spriteBoundingSize.width - 0.5;
        result.height = this.spriteBoundingSize.height - 0.5;

        result.cacheAsTexture({ resolution: this.parameters.cacheTileAsTextureResolution });

        result.hitArea = this.model.geometry.hitArea.clone();

        return result;
    }

    private getMaskedBlurredSprite(
        renderer: Renderer,
        graphicsPath: GraphicsPath,
        graphicsTexture: Texture,
        spriteWidth: number,
        spriteHeight: number,
        maskStrokeWidth: number,
        maskStrokeAlignment: number
    ): Container {
        // Изнутри маска залита чёрным, это цвет прозрачности,
        // потому что внутри - не размытая фигура
        const maskGraphics = new Graphics()
            .path(graphicsPath)
            .fill({
                color: 0x000000,
                alpha: 1
            });

        const scaleX = spriteWidth / this.spriteBoundingSize.width;
        const scaleY = spriteHeight / this.spriteBoundingSize.height;
        
        maskGraphics.scale.set(scaleX, scaleY);
        
        const minScale = Math.min(scaleX, scaleY);
        const scaledStrokeWidth = maskStrokeWidth / minScale;

        // Снаружи маски - беля обводка, это цвет непрозрачности,
        // потому что фигура по контуру будет размываться с использованием этой маски
        maskGraphics.stroke({ 
            width: scaledStrokeWidth,
            color: 0xFFFFFF,
            alpha: 1,
            alignment: maskStrokeAlignment
        });

        // Для маски берётся более высокое разрешение
        const maskTexture = renderer.generateTexture({
            target: maskGraphics,
            resolution: this.parameters.generateTileTextureResolution * 2,
            width: spriteWidth,
            height: spriteHeight,
            textureSourceOptions: {
                scaleMode: "linear"
            }
        });
        maskGraphics.destroy();

        const result = new Container();
        
        // Для размытия используется спрайт с размытым изображением фигуры
        const blurredSprite = new Sprite(graphicsTexture);
        blurredSprite.roundPixels = false;

        const blurFilter = new BlurFilter({ 
            strength: 4.0,
            quality: 5,
            kernelSize: 5
        });
        blurredSprite.filters = [blurFilter];

        blurredSprite.width = spriteWidth;
        blurredSprite.height = spriteHeight;

        const maskSprite = new Sprite(maskTexture);
        maskSprite.roundPixels = false;
        maskSprite.position.set(
            (blurredSprite.width - maskSprite.width) / 2.0,
            (blurredSprite.height - maskSprite.height) / 2.0
        );
        // Размытый спрайт маскируется с помощью маски,
        // представляющей собой обводку контура фигуры.
        // Таким образом, край фигуры окажется размытым.
        blurredSprite.mask = maskSprite;

        result.addChild(blurredSprite);
        result.addChild(maskSprite);

        return result;
    }

    private getGraphicsTexture(
        graphicsPath: GraphicsPath,
        shouldAddBevelFilter: boolean,
        padding: number = 0
    ): Texture {
        const graphics = new Graphics();
        graphics.roundPixels = false;

        const doublePadding = padding * 2;        
        const textureWidth = this.getPowerOfTwoSize(this.spriteBoundingSize.width
            + doublePadding);
        const textureHeight = this.getPowerOfTwoSize(this.spriteBoundingSize.height
            + doublePadding);
        
        const scaleX = textureWidth / this.spriteBoundingSize.width;
        const scaleY = textureHeight / this.spriteBoundingSize.height;
        
        graphics.path(graphicsPath);
        graphics.scale.set(scaleX, scaleY);
        graphics.position.set(padding, padding);
        
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
            const graphicsSideToSpriteSideRatio = graphics.width
                / this.spriteBoundingSize.width;
            bevelFilter = this.getBevelFilter(graphicsSideToSpriteSideRatio);
            graphics.filters = [bevelFilter];
        }

        const result = this.renderer.generateTexture({
            target: graphics,
            resolution: this.parameters.generateTileTextureResolution,
            width: textureWidth,
            height: textureHeight,
            textureSourceOptions: {
                scaleMode: "linear"
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
    }
}