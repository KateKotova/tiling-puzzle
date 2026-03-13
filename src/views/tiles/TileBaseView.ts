import { Texture, Container, Renderer, Color, Filter, Sprite, ContainerChild } from "pixi.js";
import { BevelFilter } from "pixi-filters";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { TileView } from "./TileView.ts";
import { TileViewCreationParameters } from "./TileViewCreationParameters.ts";
import { TileParameters } from "./TileParameters.ts";

/**
 * Базовый класс представления элемента замощения
 */
export abstract class TileBaseView implements TileView {
    protected readonly parameters: TileParameters;
    public model: TileModel;
    public texture?: Texture;
    public tile: Container;    
    public content: Container;
    protected renderer: Renderer;
    /**
     * Цвет заливки, применяемый в отсутствии текстуры
     */
    public replacingTextureFillColor: Color;

    constructor (
        parameters: TileParameters,
        creationParameters: TileViewCreationParameters
    ) {
        this.parameters = parameters;
        this.model = creationParameters.model;
        this.texture = creationParameters.texture;
        this.renderer = creationParameters.renderer;
        this.replacingTextureFillColor = creationParameters.replacingTextureFillColor;
        this.content = this.createContent(true);
        this.tile = this.createTile();
    }

    public abstract createContent(shouldAddBevelFilter: boolean): Container;

    public replaceContent(newContent: Container): void {
        const oldContent = this.content;
        TileBaseView.prepareContainerChildForDestroy(oldContent);
        oldContent.children.forEach(child => TileBaseView.prepareContainerChildForDestroy(child));
        
        this.content = newContent;
        this.tile.addChild(this.content);        
        
        if (oldContent) {
            this.tile.removeChild(oldContent);                       
            requestAnimationFrame(() => oldContent.destroy({ children: true }));
        }

        this.tile.updateCacheTexture();
    }

    protected createTile(): Container {
        const result = new Container();       
        result.addChild(this.content);        
        result.cacheAsTexture({ resolution: this.parameters.cacheTileAsTextureResolution });
        result.pivot.set(this.model.geometry.pivotPoint.x, this.model.geometry.pivotPoint.y);        
        result.rotation = this.model.currentRotationAngle;   
        result.position.copyFrom(this.model.currentPositionPoint);
        result.hitArea = this.model.geometry.hitArea.clone();     
        return result;
    }

    protected getBevelFilter(graphicsSideToSpriteSideRatio: number): BevelFilter {
        const options = this.parameters.bevelFilterOptions;
        return new BevelFilter({ 
            rotation: (options.rotation ?? 0)
                + (this.texture ? 0 : 180)
                - this.model.targetRotationAngle * 180 / Math.PI,
            thickness: (options.thickness ?? 0) * graphicsSideToSpriteSideRatio,
            lightColor: options.lightColor,
            lightAlpha: options.lightAlpha,
            shadowColor: options.shadowColor,
            shadowAlpha: options.shadowAlpha
        });
    }

    public setFilter(filter: Filter): void {
        this.tile.filters = [filter];
        this.tile.updateCacheTexture();
    }

    public removeFilters(): void {
        this.tile.filters = null;
        this.tile.updateCacheTexture();
    }

    private static prepareContainerChildForDestroy(containerChild: ContainerChild): void {
        if (containerChild.isCachedAsTexture) {
            containerChild.cacheAsTexture(false);
        }
        if (containerChild.filters?.length) {
            containerChild.filters = null;
        }
        if (containerChild.hitArea) {
            containerChild.hitArea = undefined;
        }
        if (containerChild.mask) {
            const mask = containerChild.mask as ContainerChild;
            containerChild.mask = null;
            if (mask && !mask.destroyed) {
                if (mask.parent) {
                    mask.parent.removeChild(mask);
                }
                mask.destroy();
            }
        }
        this.destroyContainerChildTextures(containerChild);
    }

    private static destroyContainerChildTextures(containerChild: ContainerChild): void {
        if (containerChild instanceof Sprite) {
            TileBaseView.destroySpriteTexture(containerChild);
        }
        
        if (containerChild instanceof Container) {
            containerChild.children.forEach(child => TileBaseView.destroySpriteTexture(child));
        }
    }

    private static destroySpriteTexture(sprite: ContainerChild): void {
        if (sprite instanceof Sprite) {
            if (sprite.texture && !sprite.texture.destroyed) {
                sprite.texture.destroy(true);
                sprite.texture = Texture.EMPTY;
            }
        }
    }

    private destroyTexture(): void {
        if (this.texture && !this.texture.destroyed) {
            this.texture.destroy(true);
        }
        this.texture = undefined;
    }

    public destroy(): void {
        TileBaseView.prepareContainerChildForDestroy(this.content);
        this.content.children.forEach(child => TileBaseView.prepareContainerChildForDestroy(child));

        TileBaseView.prepareContainerChildForDestroy(this.tile);
        this.tile.children.forEach(child => TileBaseView.prepareContainerChildForDestroy(child));

        this.tile.destroy({ children: true });            
        this.destroyTexture();
    }
}