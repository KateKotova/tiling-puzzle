import { Application, Assets, Container, ContainerChild, ContainerOptions, Graphics } from "pixi.js";
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

async function main(): Promise<void> {
  try {
    //#region test data

    //const exampleImageSrc = "assets/horse-example-image-rotated.png";
    const exampleImageSrc = "assets/horse-example-image.png";

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

    await Assets.load([
      {
        alias: "example-image",
        src: exampleImageSrc,
      },
      {
        alias: "hint-icon-path",
        src: "assets/hint-icon-path.txt",
        data: {
            parseAsGraphicsContext: true,
        }
      },
    ]);

    // TODO: сделать контроллер для этого функционала.
    // Столько всего не будет просто лежать в main.
    // я это сделаю в другой задаче.

    const settings = Settings.getInstance();
  
    const texture = Assets.get("example-image");
    const textureModel = new TilingTextureModel(texture);

    const containerWidth = app.screen.width;
    const containerHeight = app.screen.height * 2 / 3.0;

    const imageContainerModel = new ImageContainerModel(textureModel,
      containerWidth, containerHeight);      

    const rectangularGridTilingModelFactory = new RectangularGridTilingModelFactory();
    const tilingModel: RectangularGridTilingModel | null
      = rectangularGridTilingModelFactory.getTilingModel(
        settings.tileModelParameters,
        tilingType,
        textureMinSideTileCount,
        textureModel,
        imageContainerModel,
        app.renderer);
    if (!tilingModel) {
      return;
    }
    tilingModel.setShuffledTilePositions(TilingLayoutStrategyType.FromEdgesToCenter);

    const screenCenterX = app.screen.width / 2.0;
    const screenCenterY = app.screen.height / 2.0;

    const container = new Container({
      x: screenCenterX - containerWidth / 2.0,
      y: screenCenterY - containerHeight / 2.0,
      width: containerWidth,
      height: containerHeight,
    });
    app.stage.addChild(container);

    const selectedTileContainer = new Container();

    const greenBackground = new Graphics()
      .rect(0, 0, containerWidth, containerHeight)
      .fill({ color: "green" });
    greenBackground.eventMode = 'none';
    greenBackground.interactiveChildren = false;
    container.addChild(greenBackground);

    const containerCenterX = containerWidth / 2.0;
    const containerCenterY = containerHeight / 2.0;

    const zoomAndPanContainer = new ZoomAndPanContainer(      
      settings.zoomAndPanParameters,
      {
        x: containerCenterX - imageContainerModel.width / 2.0,
        y: containerCenterY - imageContainerModel.height / 2.0,
        width: imageContainerModel.width,
        height: imageContainerModel.height,
      }
    );
    container.addChild(zoomAndPanContainer);
    zoomAndPanContainer.onAddedToParent();
    draggingTileData.viewport = zoomAndPanContainer;
    zoomAndPanContainer.onDestroy = (): void => {
      draggingTileData.viewport = undefined;
    };

    const imageContainer = new Container({
      x: 0,
      y: 0,
      width: imageContainerModel.width,
      height: imageContainerModel.height,
    });
    zoomAndPanContainer.addChild(imageContainer);
    
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
      tilingModel
    );
    tilingView.createStaticTileViews(app.renderer, app.ticker);
    imageContainer.addChild(tilingView.tilingContainer);
    zoomAndPanContainer.setContentSize(imageContainerModel.width, imageContainerModel.height);
    zoomAndPanContainer.getShouldPreventEvents = (): boolean => {
      return !!draggingTileData?.animatingViews.size;
    };

    const tileLineContainer = new TileLineContainer(
      settings.tileLineParameters,
      80,
      tilingView,
      selectedTileContainer,
      app.ticker
    );
    tileLineContainer.createDraggableTileViews(app.renderer, app.ticker);
    const tileLineContainerSize = tileLineContainer.getSizeByDirection();

    const carouselContainerOptions: ContainerOptions<ContainerChild> =
      settings.tileLineParameters.directionType === TileLineDirectionType.FromLeftToRight
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
    
    window.addEventListener(TileLineContainer.startResizeEventName, () => {
      carouselContainer.setOnPointerDownActivity(false);
    });
    window.addEventListener(TileLineContainer.stopResizeEventName, () => {
      carouselContainer.setOnPointerDownActivity(true);
    });
    window.addEventListener(DraggableTileView.draggingTileIsSelectedEventName, () => {
      carouselContainer.stopInertia();
    });

    const hintIconSvgPath = Assets.get("hint-icon-path");
    const hintButton = new HintButton(
      settings.hintButtonParameters,
      app.renderer,
      hintIconSvgPath,
      tilingView.setHintAlphaForStaticTiles.bind(tilingView),
      tilingView.setDefaultAlphaForStaticTiles.bind(tilingView),
      {
        x: screenCenterX,
        y: settings.hintButtonParameters.radius
          + (settings.hintButtonParameters.glowFilterOptions.distance ?? 0)
          + 20
      }
    );
    app.stage.addChild(hintButton);

    app.stage.addChild(selectedTileContainer);
  } catch (error) {
    console.error(`Failed to start application: ${error}`);
  }
}

main();
