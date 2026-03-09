import { Texture, Container, Renderer, Color, Filter } from "pixi.js";
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
        oldContent.cacheAsTexture(false);
        
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
        result.hitArea = this.content.hitArea;     
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
        this.tile.filters = [];
        this.tile.updateCacheTexture();
    }

    public destroy(): void {
        this.tile.destroy();
    }
}