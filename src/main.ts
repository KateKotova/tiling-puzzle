import { Application, Assets, Container, Graphics } from "pixi.js";
import { TilingType } from "./models/tilings/TilingType.ts";
import { ModelSettings } from "./models/ModelSettings.ts";
import { ViewSettings } from "./views/ViewSettings.ts";
import { TilingTextureModel } from "./models/TilingTextureModel.ts";
import { ImageContainerModel } from "./models/ImageContainerModel.ts";
import { RectangularGridTilingModelFactory } from "./models/tilings/RectangularGridTilingModelFactory.ts";
import { RectangularGridTilingModel } from "./models/tilings/RectangularGridTilingModel.ts";
import { RectangularGridTilingView } from "./views/tilings/RectangularGridTilingView.ts";
import { ViewportContainer } from "./views/ViewportContainer.ts";

async function main(): Promise<void> {
  try {
    //#region test data

    //const exampleImageSrc = "assets/horse-example-image-rotated.png";
    const exampleImageSrc = "assets/horse-example-image.png";

    const containerWidth = 500;
    const containerHeight = 400;

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

    await Assets.load({
      alias: "example-image",
      src: exampleImageSrc,
    });

    const modelSettings = new ModelSettings();
    const viewSettings = new ViewSettings();
  
    const texture = Assets.get("example-image");
    const textureModel = new TilingTextureModel(texture);

    const imageContainerModel = new ImageContainerModel(textureModel,
      containerWidth, containerHeight);      

    const rectangularGridTilingModelFactory = new RectangularGridTilingModelFactory();
    const tilingModel: RectangularGridTilingModel | null
      = rectangularGridTilingModelFactory.getTilingModel(
        modelSettings,
        tilingType,
        textureMinSideTileCount,
        textureModel,
        imageContainerModel,
        app.renderer);
    if (!tilingModel) {
      return;
    }

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
    app.stage.addChild(selectedTileContainer);

    const greenBackground = new Graphics()
      .rect(0, 0, containerWidth, containerHeight)
      .fill({ color: "green" });
    container.addChild(greenBackground);

    const containerCenterX = containerWidth / 2.0;
    const containerCenterY = containerHeight / 2.0;

    const viewportContainer = new ViewportContainer(      
      viewSettings,
      {
        x: containerCenterX - imageContainerModel.width / 2.0,
        y: containerCenterY - imageContainerModel.height / 2.0,
        width: imageContainerModel.width,
        height: imageContainerModel.height,
      }
    );
    container.addChild(viewportContainer);
    viewportContainer.onAddedToParent();

    const imageContainer = new Container({
      x: 0,
      y: 0,
      width: imageContainerModel.width,
      height: imageContainerModel.height,
    });
    viewportContainer.addChild(imageContainer);
    
    const image = new Graphics()
      .rect(0, 0, imageContainerModel.width, imageContainerModel.height)
      .fill({
        texture,
        textureSpace: "local",
        alpha: 1
      });
    imageContainer.addChild(image);

    const tilingView = new RectangularGridTilingView(
      viewSettings,
      viewportContainer,
      selectedTileContainer,
      tilingModel
    );
    tilingView.setExampleTiling(app.renderer, app.ticker);
    imageContainer.addChild(tilingView.tilingContainer);
    viewportContainer.setContentSize(imageContainerModel.width, imageContainerModel.height);
    viewportContainer.getShouldPreventEvents = (): boolean => {
      return !!tilingView.draggingTileData?.animatingViews.size;
    };

    /*
    // Bunny
    const texture = await Assets.load("/assets/bunny.png");
    const bunny = new Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(bunny);

    app.ticker.add((time) => {
      bunny.rotation += 0.1 * time.deltaTime;
    });
    */
  } catch (error) {
    console.error(`Failed to start application: ${error}`);
  }
}

main();
