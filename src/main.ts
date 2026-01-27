import {
  Application,
  Assets,
  Container,
  Graphics,
  GraphicsPath,
  Matrix,
  Sprite
} from "pixi.js";
import { TilingTextureModel } from "./models/TilingTextureModel.ts";
import { ImageContainerModel } from "./models/ImageContainerModel.ts";
import { TilingType } from "./models/tilings/TilingType.ts";
//import { SquareTilingModel } from "./models/polygons/tilings/SquareTilingModel.ts";
//import { TriangleTilingModel } from "./models/polygons/tilings/TriangleTilingModel.ts";
//import { HexagonTilingModel } from "./models/polygons/tilings/HexagonTilingModel.ts";
import { OctagonAndSquareTilingModel } from "./models/polygons/tilings/OctagonAndSquareTilingModel.ts";
import { TilingModel } from "./models/tilings/TilingModel.ts";
import { RegularPolygonTilingView } from "./views/polygons/RegularPolygonTilingView.ts";

async function main(): Promise<void> {
  try {
    //#region test data

    //const exampleImageSrc = "assets/horse-example-image-rotated.png";
    const exampleImageSrc = "assets/horse-example-image.png";

    const containerWidth = 500;
    const containerHeight = 400;

    const textureMinSideTileCount = 4;
    const tilingType = TilingType.OctagonAndSquare;

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
      // case TilingType.Square:
      //   tilingModel = new SquareTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      // case TilingType.Triangle:
      //   tilingModel = new TriangleTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      // case TilingType.Hexagon:
      //   tilingModel = new HexagonTilingModel(textureModel, textureMinSideTileCount,
      //     imageContainerModel, app.renderer);
      //   break;
      case TilingType.OctagonAndSquare:
        tilingModel = new OctagonAndSquareTilingModel(textureModel, textureMinSideTileCount,
          imageContainerModel, app.renderer);
        break;
      default:
        break;
    }
    if (!tilingModel) {
      return;
    }
    tilingModel.initialize();

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

    const tilingView = new RegularPolygonTilingView(tilingModel);
    //imageContainer.addChild(tilingView.tilingContainer);
    tilingView.setExampleTiling();

    const path = `M14.1,121.9c-4-2.9-9.5-2-12.4,2c-1.1,1.5-1.7,3.3-1.7,5.2c0,0,0,51.2,0,51.2h51.2c1.9,0,3.7,0.6,5.2,1.7
        c4,2.9,4.8,8.4,2,12.4c-5,6.9-3.5,16.5,3.4,21.5c6.9,5,16.5,3.5,21.5-3.4c3.9-5.4,3.9-12.7,0-18.1c-1.1-1.5-1.7-3.3-1.7-5.2
        c0-4.9,4-8.9,8.9-8.9c0,0,51.2,0,51.2,0v-51.2c0-4.9-4-8.9-8.9-8.9c-1.9,0-3.7,0.6-5.2,1.7c-5.4,3.9-12.7,3.9-18.1,0
        c-6.9-5-8.4-14.6-3.4-21.5c5-6.9,14.6-8.4,21.5-3.4c4,2.9,9.5,2,12.4-2c1.1-1.5,1.7-3.3,1.7-5.2c0,0,0-51.2,0-51.2H90.5
        c-1.9,0-3.7-0.6-5.2-1.7c-4-2.9-4.8-8.4-2-12.4c5-6.9,3.5-16.5-3.4-21.5c-6.9-5-16.5-3.5-21.5,3.4c-3.9,5.4-3.9,12.7,0,18.1
        c1.1,1.5,1.7,3.3,1.7,5.2c0,4.9-4,8.9-8.9,8.9c0,0-51.2,0-51.2,0v51.2c0,4.9,4,8.9,8.9,8.9c1.9,0,3.7-0.6,5.2-1.7
        c5.4-3.9,12.7-3.9,18.1,0c6.9,5,8.4,14.6,3.4,21.5C30.6,125.3,21,126.9,14.1,121.9z`;
    const shape1 = new Graphics()
        //  An SVG path string or an array of PathInstruction objects.
        .path(new GraphicsPath(path))      
        // .stroke({
        //     color: "black",
        //     width: 2,
        //     alpha: 0.7
        // })
        .fill({
          texture,
          textureSpace: "local"
      });
    shape1.pivot.set(shape1.width / 2, shape1.height / 2);
    shape1.scale = 0.5;
    shape1.position.set(shape1.width / 2, shape1.height / 2); 
    imageContainer.addChild(shape1);

    const shape2 = new Graphics()
        .path(new GraphicsPath(path))      
        // .stroke({
        //     color: "black",
        //     width: 2,
        //     alpha: 0.7
        // })
        .fill({
          texture,
          textureSpace: "local",
          matrix: new Matrix()
            .rotate(-Math.PI / 2)
        });
    shape2.pivot.set(shape2.width / 2, shape2.height / 2);
    shape2.rotation = Math.PI / 2;
    shape2.scale = 0.5;
    const lockHeight = (shape2.height - shape1.width) / 2;
    shape2.position.set(shape2.height / 2 + shape1.width - lockHeight, shape2.width / 2 + lockHeight);    
    imageContainer.addChild(shape2);


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
