import { Color } from "pixi.js";
import { ZoomAndPanParameters } from "./components/ZoomAndPanParameters.ts";
import { StaticTileParameters } from "./tile-decorators/StaticTileParameters.ts";
import { DraggableTileParameters } from "./tile-decorators/DraggableTileParameters.ts";
import { TapParameters } from "./TapParameters.ts";
import { TileParameters } from "./tiles/TileParameters.ts";
import { TileLineDirectionType } from "./components/TileLineDirectionType.ts";
import { TileLineParameters } from "./components/TileLineParameters.ts";

/**
 * Класс настроек представления.
 * Предполагается, что создаётся единственный экземпляр этого класса и везде передаётся.
 */
export class ViewSettings {
    public readonly tileParameters: TileParameters = {
        cacheTileAsTextureResolution: 2,
        generateTileTextureResolution: 1,
        bevelFilterOptions: { 
            rotation: 45,
            thickness: 1.8,
            lightColor: 0xFFFFFF,
            lightAlpha: 0.8,
            shadowColor: 0x000000,
            shadowAlpha: 0.6
        }
    };

    public readonly tapParameters: TapParameters = {
        maxDuration: 200,
        maxDistance: 3
    };

    public readonly zoomAndPanParameters: ZoomAndPanParameters = {
        minScale: 1,
        maxScale: 10,
        mouseWheelScaleSensitivity: 0.001,
        touchPanSensitivity: 0.5,
        touchScaleSensitivity: 0.3
    };

    public readonly staticTileParameters: StaticTileParameters = {
        targetGlowFilterOptions: {
            distance: 9,
            outerStrength: 0,
            innerStrength: 5,
            color: new Color(0x3F00FF),
            quality: 0.5,
            knockout: false
        }
    };

    public readonly draggableTileParameters: DraggableTileParameters = {
        selectedGlowFilterOptions: {
            distance: 7,
            outerStrength: 0,
            innerStrength: 4,
            color: new Color(0x00FFFF),
            quality: 0.5,
            knockout: false
        },
        correctLocatedFilterShowTime: 500,
        correctLocatedGlowFilterOptions: {
            distance: 12,
            outerStrength: 0,
            innerStrength: 7,
            color: new Color(0x00FF00),
            quality: 0.5,
            knockout: false
        },
        tapParameters: this.tapParameters
    };

    public readonly tileLineParameters: TileLineParameters = {
        directionType: TileLineDirectionType.FromLeftToRight,
        longitudinalContentOffset: 12,
        transverseContentOffset: 12,
        betweenTilesOffset: 12
    }
}