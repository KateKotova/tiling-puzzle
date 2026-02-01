import { BevelFilterOptions, GlowFilter } from "pixi-filters";
import { Color } from "pixi.js";

export class ViewSettings {
    public tileTextureResolution: number = 2;
    public bevelFilterOptions: BevelFilterOptions = { 
        rotation: 45,
        thickness: 1.8,
        lightColor: 0xFFFFFF,
        lightAlpha: 0.8,
        shadowColor: 0x000000,
        shadowAlpha: 0.6
    };
    public selectedTileGlowFilterColor: Color = new Color(0x00FFFF);
    public selectedTileGlowFilter: GlowFilter = new GlowFilter({
        distance: 5,
        outerStrength: 2,
        innerStrength: 1,
        color: this.selectedTileGlowFilterColor,
        quality: 0.5,
        knockout: false
    });
}