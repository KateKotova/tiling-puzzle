import {
  Application,
  Assets,
  Color,
  Texture
} from "pixi.js";
import { TilingType } from "./models/tilings/TilingType.ts";
import { Settings } from "./Settings.ts";
import { TilingLayoutStrategyType } from "./models/tilings/TilingLayoutStrategyType.ts";
import { TilingLevelUniqueParameters } from "./views/components/tiling-level/container/TilingLevelUniqueParameters.ts";
import { TilingLevelContainer } from "./views/components/tiling-level/container/TilingLevelContainer.ts";

async function main(): Promise<void> {
  try {
    const app = new Application();
    // @ts-expect-error PixiJS DevTools
    globalThis.__PIXI_APP__ = app;

    await app.init({
      background: "#8BB4D8",
      resizeTo: window,
      //antialias: true
    });
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    const assetSizes = {
      '0.5x': { maxSize: 256, quality: 1 },
      '1x': { maxSize: 512, quality: 0.9 },
      '2x': { maxSize: 1024, quality: 0.8 },
      '3x': { maxSize: 2048, quality: 0.7 }
    };

    const manifest = {
      bundles: [
        {
          name: 'fonts',
          assets: [
            {
              alias: "GOST_type_A",
              src: "assets/fonts/GOST_type_A.fnt",
              data: {
                parser: "loadBitmapFont"
              }
            }
          ]
        },
        {
          name: 'every-level-screen',
          assets: [
            {
              alias: "eye-hint-icon-path",
              src: "assets/eye-hint-icon-path.txt",
              data: {
                  parseAsGraphicsContext: true
              }
            },
            {
              alias: "lamp-hint-icon-path",
              src: "assets/lamp-hint-icon-path.txt",
              data: {
                  parseAsGraphicsContext: true
              }
            }
          ]
        },
        {
          name: 'horse-level-screen',
          assets: [
            {
              alias: 'horse',
              src: 'assets/horse@{0.5,1,2,3}x.{png,webp}',
              loadParser: 'loadTextures',
              format: 'webp',
              data: {
                sizes: assetSizes
              }
            },
            {
              alias: 'horse-rotated',
              src: 'assets/horse-rotated@{0.5,1,2,3}x.{png,webp}',
              loadParser: 'loadTextures',
              format: 'webp',
              data: {
                sizes: assetSizes
              }
            }
          ],
        },
      ],
    };

    await Assets.init({ manifest });

    // TODO: не забыть сделать Assets.unloadBundle
    await Assets.loadBundle('fonts');
    await Assets.loadBundle('every-level-screen');
    await Assets.loadBundle('horse-level-screen');

    const settings = Settings.getInstance();

    const tilingLevelUniqueParameters: TilingLevelUniqueParameters = {
      imageParameters: {
        textureMinSideTileCount: 2,
        tilingType: TilingType.TriangleWithSpiralLockWithTail,
        tilingTexture: Assets.get<Texture>("horse"),
        tilingLayoutStrategyType: TilingLayoutStrategyType.FromEdgesToCenter,
        defaultStaticTileFillColor: new Color(0x709DC1),
        targetStaticTileFillColor: new Color(0x83B9DD)
      },
      carouselParameters: {
        tileLineBackgroundFillColor: new Color(0x83B9DD),
        carouselBackgroundFillColor: new Color(0x709DC1)
      },
      eyeHintButtonIconSvgPath: Assets.get<string>("eye-hint-icon-path"),
      lampHintButtonIconSvgPath: Assets.get<string>("lamp-hint-icon-path"),
    };

    const tilingLevelContainer = new TilingLevelContainer(
      settings.tilingLevelParameters,
      tilingLevelUniqueParameters,
      app.renderer,
      app.ticker,
      {
        x: 0,
        y: 0,
        width: app.screen.width,
        height: app.screen.height
      }
    );

    app.stage.addChild(tilingLevelContainer);

    const appElement = document.getElementById('app');
    const loadingElement = document.getElementById('loading-container');
    
    if (appElement && loadingElement) {
      appElement.classList.add('visible');
      loadingElement.classList.add('hidden');
      setTimeout(() => loadingElement.style.display = "none", 500);
    }

  } catch (error) {
    console.error(`Failed to start application: ${error}`);
  }
}

main();
