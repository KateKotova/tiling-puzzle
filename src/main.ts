import {
  Application,
  Assets,
  Color,
  Texture
} from "pixi.js";
import { TilingType } from "./models/tilings/TilingType.ts";
import { Settings } from "./Settings.ts";
import { TilingLayoutStrategyType } from "./models/tilings/TilingLayoutStrategyType.ts";
import { TilingLevelUniqueParameters } from "./views/components/TilingLevelUniqueParameters.ts";
import { TilingLevelContainer } from "./views/components/TilingLevelContainer.ts";

async function main(): Promise<void> {
  try {
    const app = new Application();
    // @ts-expect-error PixiJS DevTools
    globalThis.__PIXI_APP__ = app;

    await app.init({
      background: "#1099bb",
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
          name: 'every-level-screen',
          assets: [
            {
              alias: "hint-icon-path",
              src: "assets/hint-icon-path.txt",
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
    await Assets.loadBundle('every-level-screen');
    await Assets.loadBundle('horse-level-screen');

    const settings = Settings.getInstance();

    const tilingLevelUniqueParameters: TilingLevelUniqueParameters = {
      imageParameters: {
        textureMinSideTileCount: 4,
        tilingType: TilingType.OctagonAndSquareWithSingleLock,
        tilingTexture: Assets.get<Texture>("horse"),
        tilingLayoutStrategyType: TilingLayoutStrategyType.FromEdgesToCenter,
        defaultStaticTileFillColor: new Color(0x008F00),
        targetStaticTileFillColor: new Color(0x00AF00)
      },
      carouselParameters: {
        tileLineBackgroundFillColor: new Color(0x008F00),
        carouselBackgroundFillColor: new Color(0x00AF00)
      },
      hintButtonIconSvgPath: Assets.get<string>("hint-icon-path")
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

  } catch (error) {
    console.error(`Failed to start application: ${error}`);
  }
}

main();
