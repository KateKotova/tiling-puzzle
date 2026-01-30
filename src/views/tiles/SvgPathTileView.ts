import { BlurFilter, Color, Container, Graphics, GraphicsPath, Renderer, Sprite, Texture } from "pixi.js";
import { TileView } from "./TileView.ts";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel.ts";

export class SvgPathTileView extends TileView {
    constructor (model: TileModel) {
        if (model instanceof RegularPolygonTileModel) {
            throw new Error("The tile must not be an instance of RegularPolygonTileModel");
        }
        super(model);
    }

    public getContainer(renderer: Renderer, replacingTextureFillColor: Color): Container {
        const svgData = this.model.getSvgData();
        if (!svgData) {
            throw new Error("The svg data of the tile should not be null");
        }

        const graphicsPath = new GraphicsPath(svgData.path);
        const graphicsTexture = this.getGraphicsTexture(renderer, graphicsPath,
            replacingTextureFillColor);

        const sprite = new Sprite(graphicsTexture);
        sprite.width = this.model.rotatingBoundingRectangleSize.width;
        sprite.height = this.model.rotatingBoundingRectangleSize.height;
        sprite.roundPixels = false;

        const result = new Container();        
        result.addChild(sprite);
        
        const bluredSpriteWithMask = this.getBluredSpriteWithMask(renderer, graphicsPath,
            graphicsTexture, sprite.width, sprite.height);
        result.addChild(bluredSpriteWithMask);
        
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

        const spriteSizeToGraphicsRatio = this.model.rotatingBoundingRectangleSize.width
            / maskGraphics.width;
        const resultStrokeWidth = 1;

        maskGraphics.stroke({ 
            width: Math.trunc(resultStrokeWidth / spriteSizeToGraphicsRatio),
            color: 0xFFFFFF, 
            alpha: 1,
            alignment: 0.5 
        });

        const maskTexture = renderer.generateTexture({
            target: maskGraphics,
            resolution: 2,
            width: spriteWidth,
            height: spriteHeight
        });
        
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
            (result.width - maskSprite.width) / 2,
            (result.height - maskSprite.height) / 2
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

        const textureWidth = this.getPowerOfTwoSize(
            this.model.rotatingBoundingRectangleSize.width);
        const textureHeight = this.getPowerOfTwoSize(
            this.model.rotatingBoundingRectangleSize.height);

        return renderer.generateTexture({
            target: graphics,
            resolution: 2,
            width: textureWidth,
            height: textureHeight,
            textureSourceOptions: {
                scaleMode: 'linear'
            }
        });
    }

    private getPowerOfTwoSize(size: number): number {
        return Math.pow(2, Math.ceil(Math.log2(size)));
    };
}