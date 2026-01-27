import {
  Application,
  Assets,
  Container,
  Graphics
} from "pixi.js";
import { TilingTextureModel } from "./models/TilingTextureModel.ts";
import { ImageContainerModel } from "./models/ImageContainerModel.ts";
import { TilingType } from "./models/tilings/TilingType.ts";
import { SquareTilingModel } from "./models/polygons/tilings/SquareTilingModel.ts";
//import { TriangleTilingModel } from "./models/polygons/tilings/TriangleTilingModel.ts";
//import { HexagonTilingModel } from "./models/polygons/tilings/HexagonTilingModel.ts";
//import { OctagonAndSquareTilingModel } from "./models/polygons/tilings/OctagonAndSquareTilingModel.ts";
import { TilingModel } from "./models/tilings/TilingModel.ts";
import { RegularPolygonTilingView } from "./views/polygons/RegularPolygonTilingView.ts";
//import { SquareWithSingleLockTilingView } from "./views/polygons/SquareWithSingleLockTilingView.ts";
//import { SquareWithSingleLockTilingModel } from "./models/polygons/tilings/SquareWithSingleLockTilingModel.ts";

async function main(): Promise<void> {
  try {
    //#region test data

    //const exampleImageSrc = "assets/horse-example-image-rotated.png";
    const exampleImageSrc = "assets/horse-example-image.png";

    const containerWidth = 500;
    const containerHeight = 400;

    const textureMinSideTileCount = 4;
    const tilingType = TilingType.Square;

    //#endregion test data end

    const app = new Application();
    // @ts-expect-error PixiJS DevTools
    globalThis.__PIXI_APP__ = app;

    await app.init({ background: "#1099bb", resizeTo: window });
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    await Assets.load({
      alias: "example-image",
      src: exampleImageSrc,
    });

    const texture = Assets.get("example-image");
    const textureModel = new TilingTextureModel(texture);

    const imageContainerModel = new ImageContainerModel(textureModel,
      containerWidth, containerHeight);

    let tilingModel: TilingModel | null = null;

    switch (tilingType) {
      case TilingType.Square:
        tilingModel = new SquareTilingModel(textureModel, textureMinSideTileCount,
          imageContainerModel, app.renderer);
        break;
      // case TilingType.Triangle:
      //   tilingModel = new TriangleTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      // case TilingType.Hexagon:
      //   tilingModel = new HexagonTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      // case TilingType.OctagonAndSquare:
      //   tilingModel = new OctagonAndSquareTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      // case TilingType.SquareWithSingleLock:
      //   tilingModel = new SquareWithSingleLockTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      default:
        break;
    }
    if (!tilingModel) {
      return;
    }
    tilingModel.initialize();

    const screenCenterX = app.screen.width / 2.0;
    const screenCenterY = app.screen.height / 2.0;

    const container = new Container({
      x: screenCenterX - containerWidth / 2.0,
      y: screenCenterY - containerHeight / 2.0,
      width: containerWidth,
      height: containerHeight,
    });
    app.stage.addChild(container);

    const greenBackground = new Graphics()
      .rect(0, 0, containerWidth, containerHeight)
      .fill({ color: "green" });
    container.addChild(greenBackground);

    const containerCenterX = containerWidth / 2.0;
    const containerCenterY = containerHeight / 2.0;

    const imageContainer = new Container({
      x: containerCenterX - imageContainerModel.width / 2.0,
      y: containerCenterY - imageContainerModel.height / 2.0,
      width: imageContainerModel.width,
      height: imageContainerModel.height,
    });
    container.addChild(imageContainer);

    const image = new Graphics()
      .rect(0, 0, imageContainerModel.width, imageContainerModel.height)
      .fill({
        texture,
        textureSpace: "local",
        alpha: 0.5
      });
    imageContainer.addChild(image);

    const tilingView = new RegularPolygonTilingView(tilingModel);
    imageContainer.addChild(tilingView.tilingContainer);
    tilingView.setExampleTiling();

    // const tilingView = new SquareWithSingleLockTilingView(tilingModel);
    // imageContainer.addChild(tilingView.tilingContainer);
    // tilingView.setExampleTiling();

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
