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

async function main(): Promise<void> {
  try {
    //#region test data

    //const exampleImageSrc = "assets/horse-example-image-rotated.png";
    const exampleImageSrc = "assets/horse-example-image.png";

    const containerWidth = 500;
    const containerHeight = 400;

    const textureMinSideTileCount = 3;
    const tilingType = TilingType.Square;

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

    await Assets.load({
      alias: "example-image",
      src: exampleImageSrc,
    });

    // TODO: сделать контроллер для этого функционала.
    // Столько всего не будет просто лежать в main.
    // я это сделаю в другой задаче.

    const settings = Settings.getInstance();
  
    const texture = Assets.get("example-image");
    const textureModel = new TilingTextureModel(texture);

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
    tilingView.createStaticTileViews(app.renderer);
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
      settings.tileLineParameters.directionType == TileLineDirectionType.FromLeftToRight
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
    
    const carouselContainer = new CarouselContainer(carouselContainerOptions);
    carouselContainer.addChild(tileLineContainer);
    tileLineContainer.onAddedToParent(carouselContainer);
    carouselContainer.setContentSize(tileLineContainerSize.width, tileLineContainerSize.height);
    app.stage.addChild(carouselContainer);
    carouselContainer.onAddedToParent();

    app.stage.addChild(selectedTileContainer);
  } catch (error) {
    console.error(`Failed to start application: ${error}`);
  }
}

main();
