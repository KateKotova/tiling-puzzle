import {
  Application,
  Assets,
  Color,
  Container,
  ContainerChild,
  ContainerOptions,
  Graphics,
  Point,
  Texture
} from "pixi.js";
import { TilingType } from "./models/tilings/TilingType.ts";
import { Settings } from "./Settings.ts";
import { TilingTextureModel } from "./models/TilingTextureModel.ts";
import { ImageContainerModel } from "./models/ImageContainerModel.ts";
import { RectangularGridTilingModelFactory }
  from "./models/tilings/RectangularGridTilingModelFactory.ts";
import { RectangularGridTilingModel } from "./models/tilings/RectangularGridTilingModel.ts";
import { TilingView } from "./views/tilings/TilingView.ts";
import { ZoomAndPanContainer } from "./views/components/ZoomAndPanContainer.ts";
import { TilingLayoutStrategyType } from "./models/tilings/TilingLayoutStrategyType.ts";
import { draggingTileData } from "./views/tile-decorators/DraggingTileData.ts";
import { TileLineContainer } from "./views/components/TileLineContainer.ts";
import { TileLineDirectionType } from "./views/components/TileLineDirectionType.ts";
import { CarouselContainer } from "./views/components/CarouselContainer.ts";
import { DraggableTileView } from "./views/tile-decorators/DraggableTileView.ts";
import { HintButton } from "./views/components/HintButton.ts";
import { TileLineLayoutType } from "./views/components/TileLineLayoutType.ts";
import { CarouselDirectionType } from "./views/components/CarouselDirectionType.ts";

async function main(): Promise<void> {
  try {
    //#region test data

    const textureMinSideTileCount = 4;
    const tilingType = TilingType.OctagonAndSquareWithSingleLock;

    //#endregion test data end

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

    // TODO: сделать контроллер для этого функционала.
    // Столько всего не будет просто лежать в main.
    // я это сделаю в другой задаче.

    const settings = Settings.getInstance();

    const texture = Assets.get<Texture>("horse");
    const textureModel = new TilingTextureModel(texture);

    const imageMaxAreaWidth = app.screen.width;
    const imageMaxAreaHeight = app.screen.height * 2 / 3.0;

    const imageContainerModel = new ImageContainerModel(textureModel,
      imageMaxAreaWidth, imageMaxAreaHeight);      

    const rectangularGridTilingModelFactory = new RectangularGridTilingModelFactory();
    const tilingModel: RectangularGridTilingModel | undefined =
      rectangularGridTilingModelFactory.getTilingModel(
      settings.tileModelParameters,
      tilingType,
      textureMinSideTileCount,
      textureModel,
      imageContainerModel,
      app.renderer
    );
    if (!tilingModel) {
      return;
    }
    tilingModel.setShuffledTilePositions(TilingLayoutStrategyType.FromEdgesToCenter);

    const screenCenterX = app.screen.width / 2.0;
    const screenCenterY = app.screen.height / 2.0;

    const imageAreaContainer = new Container({
      x: screenCenterX - imageMaxAreaWidth / 2.0,
      y: screenCenterY - imageMaxAreaHeight / 2.0,
      width: imageMaxAreaWidth,
      height: imageMaxAreaHeight,
    });
    app.stage.addChild(imageAreaContainer);

    const selectedTileContainer = new Container();

    const imageAreaBackground = new Graphics()
      .rect(0, 0, imageMaxAreaWidth, imageMaxAreaHeight)
      .fill({ color: "green" });
    imageAreaBackground.eventMode = 'none';
    imageAreaBackground.interactiveChildren = false;
    imageAreaContainer.addChild(imageAreaBackground);

    const containerCenterX = imageMaxAreaWidth / 2.0;
    const containerCenterY = imageMaxAreaHeight / 2.0;

    const imageZoomAndPanContainer = new ZoomAndPanContainer(      
      settings.zoomAndPanParameters,
      {
        x: containerCenterX - imageContainerModel.width / 2.0,
        y: containerCenterY - imageContainerModel.height / 2.0,
        width: imageContainerModel.width,
        height: imageContainerModel.height,
      }
    );
    imageAreaContainer.addChild(imageZoomAndPanContainer);
    imageZoomAndPanContainer.onAddedToParent();
    draggingTileData.viewport = imageZoomAndPanContainer;
    imageZoomAndPanContainer.onDestroy = (): void => {
      draggingTileData.viewport = undefined;
    };

    const imageContainer = new Container({
      x: 0,
      y: 0,
      width: imageContainerModel.width,
      height: imageContainerModel.height,
    });
    imageZoomAndPanContainer.addChild(imageContainer);
    
    const image = new Graphics()
      .rect(0, 0, imageContainerModel.width, imageContainerModel.height)
      .fill({
        texture,
        textureSpace: "local",
        alpha: 1
      });
    imageContainer.addChild(image);

    const tilingView = new TilingView(
      settings.tilingParameters,
      tilingModel,
      new Color(0x008F00),
      new Color(0x00AF00)
    );
    tilingView.createStaticTileViews(app.renderer, app.ticker);
    imageContainer.addChild(tilingView.tilingContainer);
    imageZoomAndPanContainer.setContentSize(imageContainerModel.width, imageContainerModel.height);
    imageZoomAndPanContainer.getShouldPreventEvents = (): boolean => {
      return !!draggingTileData?.animatingViews.size;
    };

    const tileLineContainer = new TileLineContainer(
      settings.tileLineParameters,
      {
        directionType: TileLineDirectionType.FromLeftToRight,
        layoutType: TileLineLayoutType.Bottom,
        transverseSize: 80,      
        tilingView,
        selectedTileContainer,
        ticker: app.ticker,
        backgroundFillColor: new Color(0x00AA00)
      }
    );
    tileLineContainer.createDraggableTileViews(app.renderer, app.ticker);
    const tileLineContainerSize = tileLineContainer.getSizeByDirection();

    const carouselContainerOptions: ContainerOptions<ContainerChild> =
      tileLineContainer.directionType === TileLineDirectionType.FromLeftToRight
      ? {
        x: 25,
        y: app.screen.height - tileLineContainerSize.height - 25,
        width: app.screen.width - 50,
        height: tileLineContainerSize.height
      }
      : {
        x: 25,
        y: 25,
        width: tileLineContainerSize.width,
        height: app.screen.height - 50
      };

    const carouselContainer = new CarouselContainer(
      settings.carouselParameters,
      CarouselDirectionType.Horizontal,
      app.ticker,
      carouselContainerOptions
    );
    
    carouselContainer.onBeforeAddToParent(app.stage);
    app.stage.addChild(carouselContainer);
    carouselContainer.onAddedToParent();
    carouselContainer.addChild(tileLineContainer);
    tileLineContainer.onAddedToParent(carouselContainer);
    carouselContainer.setContentSize(tileLineContainerSize.width, tileLineContainerSize.height);
    carouselContainer.getShouldPreventEvents = (): boolean => {
      return !!draggingTileData.view;
    };

    window.addEventListener(TileLineContainer.tileLineStartResizeEventName, () => {
      carouselContainer.setOnPointerDownActivity(false);
    });
    window.addEventListener(TileLineContainer.tileLineStopResizeEventName, () => {
      carouselContainer.setOnPointerDownActivity(true);
    });
    window.addEventListener(DraggableTileView.draggingTileWasSelectedEventName, () => {
      carouselContainer.stopInertia();
    });

    // TODO

    const hintIconSvgPath = Assets.get<string>("hint-icon-path");
    const hintButton = new HintButton(
      settings.hintButtonParameters,
      app.renderer,
      25,    
      hintIconSvgPath,
      new Point(
        screenCenterX,
        25
          + (settings.hintButtonParameters.glowFilterOptions.distance ?? 0)
          + 20
      )
    );
    app.stage.addChild(hintButton);

    window.addEventListener(HintButton.hintButtonWasActivatedEventName, () => {
      tilingView.setHintAlphaForStaticTiles();
    });

    window.addEventListener(HintButton.hintButtonWasDeactivatedEventName, () => {
      tilingView.setDefaultAlphaForStaticTiles();
    });

    app.stage.addChild(selectedTileContainer);
  } catch (error) {
    console.error(`Failed to start application: ${error}`);
  }
}

main();
