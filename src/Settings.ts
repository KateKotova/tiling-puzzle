import { Color } from "pixi.js";
import { ZoomAndPanParameters } from "./views/components/ZoomAndPanParameters.ts";
import { StaticTileParameters } from "./views/tile-decorators/StaticTileParameters.ts";
import { DraggableTileParameters } from "./views/tile-decorators/DraggableTileParameters.ts";
import { TapParameters } from "./views/TapParameters.ts";
import { TileParameters as TileViewParameters} from "./views/tiles/TileParameters.ts";
import { TileParameters as TileModelParameters} from "./models/tiles/TileParameters.ts";
import { TileLineDirectionType } from "./views/components/TileLineDirectionType.ts";
import { TileLineParameters } from "./views/components/TileLineParameters.ts";
import { TilingParameters } from "./views/tilings/TilingParameters.ts";
import { TileLineLayoutType } from "./views/components/TileLineLayoutType.ts";
import { AnimationParameters } from "./AnimationParameters.ts";

/**
 * Singleton-класс настроек представления.
 * Предполагается, что создаётся единственный экземпляр этого класса и везде передаётся.
 */
export class Settings {
    private static instance: Settings;

    private constructor() {
    }

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    public readonly animationParameters: AnimationParameters = {
        animationTime: 300,
        accelerationTimeToAnimationTimeRatio: 0.3
    };

    public readonly tileModelParameters: TileModelParameters = {
        animationParameters: this.animationParameters
    };

    public readonly tileViewParameters: TileViewParameters = {
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
        maxScale: 2,
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

    public readonly tilingParameters: TilingParameters = {
        tileParameters: this.tileViewParameters,
        staticTileParameters: this.staticTileParameters
    };

    public readonly tileLineParameters: TileLineParameters = {
        directionType: TileLineDirectionType.FromLeftToRight,
        layoutType: TileLineLayoutType.Bottom,
        longitudinalContentOffset: 12,
        transverseContentOffset: 12,
        betweenTilesOffset: 12,
        tileParameters: this.tileViewParameters,
        draggableTileParameters: this.draggableTileParameters,
        animationParameters: this.animationParameters
    }
}