import { Color, Container, Renderer } from "pixi.js";
import { TileModel } from "../../models/tiles/TileModel.ts";
import { BevelFilter, GlowFilter } from "pixi-filters";

export abstract class TileView {
    public static readonly textureResolution: number = 2;
    private static readonly selectedTileGlowFilterColor: Color = new Color(0x00FFFF);
    private static readonly selectedTileGlowFilter: GlowFilter = new GlowFilter({
        distance: 5,
        outerStrength: 2,
        innerStrength: 1,
        color: TileView.selectedTileGlowFilterColor,
        quality: 0.5,
        knockout: false
    });
    public model: TileModel;
    public tile: Container | undefined = undefined;
    
    constructor (model: TileModel) {
        this.model = model;
    }

    public abstract setTile(renderer: Renderer, replacingTextureFillColor: Color): void;

    protected getBevelFilter(graphicsSideToSpriteSideRatio: number): BevelFilter {
        return new BevelFilter({ 
            rotation: 45
                + (this.model.texture ? 0 : 180)
                - this.model.rotationAngle * 180 / Math.PI,
            thickness: 1.8 * graphicsSideToSpriteSideRatio,
            lightColor: 0xFFFFFF,
            lightAlpha: 0.5,
            shadowColor: 0x000000,
            shadowAlpha: 0.5
        });
    }

    public prepareToRotation(angleDifference: number): void {
        if (!this.tile || this.model.isRotating) {
            return;
        }
        this.model.prepareToRotation(angleDifference);
        if (this.tile.filters) {
            this.tile.filters = [...this.tile.filters, TileView.selectedTileGlowFilter];
        } else {
            this.tile.filters = [TileView.selectedTileGlowFilter];
        }
    }

    public completeRotation(angleDifference: number): void {
        if (!this.tile || !this.model.isRotating) {
            return;
        }
        if (this.tile.filters) {
            this.tile.filters = this.tile.filters.filter(item =>
                item !== TileView.selectedTileGlowFilter);
        }
        this.model.completeRotation(angleDifference);
    }
}