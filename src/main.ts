import {
  Application,
  Assets,
  Container,
  Graphics
} from "pixi.js";
import { TilingTextureModel } from "./TilingTextureModel.ts";
import { ImageContainerModel } from "./ImageContainerModel.ts";
import { SquareTilingModel } from "./SquareTilingModel.ts";
import { SquareTilingView } from "./SquareTilingView.ts";

async function main(): Promise<void> {
  try {
    const app = new Application();
    // @ts-expect-error PixiJS DevTools
    globalThis.__PIXI_APP__ = app;

    await app.init({ background: "#1099bb", resizeTo: window });
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    await Assets.load({
      alias: "example-image",
      src: "assets/horse-example-image.png",
    });

    const texture = Assets.get("example-image");
    const textureModel = new TilingTextureModel(texture);

    const containerWidth = 500;
    const containerHeight = 400;
    const imageContainerModel = new ImageContainerModel(textureModel,
      containerWidth, containerHeight);

    const textureMinSideTileCount = 5;
    const tilingModel = new SquareTilingModel(textureModel, textureMinSideTileCount,
      imageContainerModel, app.renderer);
    
    const screenCenterX = app.screen.width / 2;
    const screenCenterY = app.screen.height / 2;

    const container = new Container({
      x: screenCenterX - containerWidth / 2,
      y: screenCenterY - containerHeight / 2,
      width: containerWidth,
      height: containerHeight,
    });
    app.stage.addChild(container);

    const greenBackground = new Graphics()
      .rect(0, 0, containerWidth, containerHeight)
      .fill({ color: "green" });
    container.addChild(greenBackground);

    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;

    const imageContainer = new Container({
      x: containerCenterX - imageContainerModel.width / 2,
      y: containerCenterY - imageContainerModel.height / 2,
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

    const tilingView = new SquareTilingView(tilingModel);
    const tilingContainer = tilingView.getTilingContainer();
    imageContainer.addChild(tilingContainer);

    const tileGraphicContext = tilingView.getTileGraphicContext();
    tilingView.setExampleTiling(tilingContainer, tileGraphicContext);
    
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
