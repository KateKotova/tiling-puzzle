import { Color } from "pixi.js";
import { ZoomAndPanParameters } from "./views/components/zoom-and-pan/ZoomAndPanParameters.ts";
import { StaticTileParameters } from "./views/tile-decorators/StaticTileParameters.ts";
import { DraggableTileParameters } from "./views/tile-decorators/DraggableTileParameters.ts";
import { TapParameters } from "./views/TapParameters.ts";
import { TileParameters as TileViewParameters } from "./views/tiles/TileParameters.ts";
import { TileParameters as TileModelParameters } from "./models/tiles/TileParameters.ts";
import { TileLineParameters } from "./views/components/tile-line/TileLineParameters.ts";
import { TilingParameters } from "./views/tilings/TilingParameters.ts";
import { AnimationParameters } from "./AnimationParameters.ts";
import { CarouselParameters } from "./views/components/carousel/CarouselParameters.ts";
import { HintButtonParameters } from "./views/components/hint-button/HintButtonParameters.ts";
import { TilingLevelParameters } from "./views/components/tiling-level/container/TilingLevelParameters.ts";
import { Padding } from "./math/Padding.ts";

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
        },
        defaultAlpha: 1,
        hintAlpha: 0.7,
        transparentAlpha: 0
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
        staticTileParameters: this.staticTileParameters,
        animationParameters: this.animationParameters,
        tapParameters: this.tapParameters,
        imageInitialShowTime: 2000
    };

    public readonly tileLineParameters: TileLineParameters = {
        longitudinalContentOffsetToTransverseSizeRatio: 0.1,
        transverseContentOffsetToTransverseSizeRatio: 0.1,
        betweenTilesOffsetToTransverseSizeRatio: 0.5,
        tileParameters: this.tileViewParameters,
        draggableTileParameters: this.draggableTileParameters,
        animationParameters: this.animationParameters
    }

    public readonly carouselParameters: CarouselParameters = {
        pointerSensitivity: 1,
        velocityParameters: {
            minValue: 0.5,
            maxValue: 100,
            maxValueCount: 5,
            extremeZoneMaxValueMultiplier: 2
        },
        velocityMultiplier: 30,
        deceleratedMotionParameters: {
            absoluteAcceleration: 0.00004,
            minMotionTime: 1500,
            minMotionToBoundTime: 750
        }
    };

    public readonly hintButtonParameters: HintButtonParameters = {
        generateTextureResolution: 2,
        glowFilterOptions: {
            distance: 7,
            outerStrength: 3,
            innerStrength: 2,
            color: new Color(0xFFFF00),
            quality: 0.5,
            knockout: false
        },
        iconSideToDiameterRatio: 0.6,
        defaultFillColor: new Color(0x008800),
        activeFillColor: new Color(0x888800),
        strokeWidth: 2,
        defaultStrokeColor: new Color(0x006600),
        activeStrokeColor: new Color(0x666600),
        defaultIconFillColor: new Color(0xFFFFFF),
        activeIconFillColor: new Color(0x000000)
    };

    public readonly tilingLevelParameters: TilingLevelParameters = {
        imageParameters: {
            tileModelParameters: this.tileModelParameters,  
            zoomAndPanParameters: this.zoomAndPanParameters,
            tilingParameters: this.tilingParameters,
            padding: new Padding()
        },
        carouselParameters: {
            tileLineParameters: this.tileLineParameters,
            carouselParameters: this.carouselParameters,
            padding: new Padding()
        },
        controlParameters: {
            hintButtonParameters: this.hintButtonParameters,
            hintButtonCenterXToControlContainerWidthRatio: 0.5,
            hintButtonCenterYToControlContainerHeightRatio: 0.5,
            hintButtonRadiusToControlContainerHeightRatio: 0.35
        },
        controlContainerHeightToHeightRatio: 0.1,
        carouselContainerHeightToHeightRatio: 0.125
    };
}