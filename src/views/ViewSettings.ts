import { BevelFilterOptions, GlowFilterOptions } from "pixi-filters";
import { Color } from "pixi.js";

/**
 * Класс настроек представления.
 * Предполагается, что создаётся единственный экземпляр этого класса и везде передаётся.
 */
export class ViewSettings {
    public readonly cacheTileAsTextureResolution: number = 2;
    public readonly generateTileTextureResolution: number = 1;
    public readonly bevelFilterOptions: BevelFilterOptions = { 
        rotation: 45,
        thickness: 1.8,
        lightColor: 0xFFFFFF,
        lightAlpha: 0.8,
        shadowColor: 0x000000,
        shadowAlpha: 0.6
    };
    public readonly selectedTileGlowFilterColor: Color = new Color(0x00FFFF);
    public readonly selectedTileGlowFilterOptions: GlowFilterOptions = {
        distance: 5,
        outerStrength: 2,
        innerStrength: 1,
        color: this.selectedTileGlowFilterColor,
        quality: 0.5,
        knockout: false
    };
    public readonly tapMaxDuration: number = 200;
    public readonly tapMaxDistance: number = 3;
    public readonly targetStaticTileGlowFilterColor: Color = new Color(0x3F00FF);
    public readonly targetStaticTileGlowFilterOptions: GlowFilterOptions = {
        distance: 5,
        outerStrength: 1,
        innerStrength: 5,
        color: this.targetStaticTileGlowFilterColor,
        quality: 0.5,
        knockout: false
    };
}