import {
  Application,
  Assets,
  Container,
  Graphics,
  GraphicsContext
} from "pixi.js";
import { TilingTextureModel } from "./TilingTextureModel.ts";
import { ImageContainerModel } from "./ImageContainerModel.ts";
import { SquareTilingModel } from "./SquareTilingModel.ts";

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

    const textureMinSideSquareCount = 5;
    const squareTilingModel = new SquareTilingModel(textureModel, textureMinSideSquareCount,
      imageContainerModel, app.renderer);
    
    /*const textureWidth = texture.width;
    const textureHeight = texture.height;
    const textureWidthToHeightRatio = textureWidth / textureHeight;

    const textureMinSide = Math.min(textureWidth, textureHeight);
    //const textureMinSideSquareCount = 5;
    const textureSquareSide = textureMinSide / textureMinSideSquareCount;

    const textureWidthToTextureSquareSideRatio = textureWidth / textureSquareSide;
    const textureHeightToTextureSquareSideRatio = textureHeight / textureSquareSide;

    const textureWidthSquareCount = Math.trunc(textureWidthToTextureSquareSideRatio);
    const textureHeightSquareCount = Math.trunc(textureHeightToTextureSquareSideRatio);    

    const textureXSquaresOffset = (textureWidth - textureSquareSide * textureWidthSquareCount) / 2;
    const textureYSquaresOffset = (textureHeight - textureSquareSide * textureHeightSquareCount) / 2;

    //const containerWidth = 500;
    //const containerHeight = 400;

    let imageWidth = containerWidth;
    let imageHeight = imageWidth / textureWidthToHeightRatio;

    if (imageHeight > containerHeight) {
      imageHeight = containerHeight;
      imageWidth = imageHeight * textureWidthToHeightRatio;
    }

    const imageSideToTextureSideRatio = imageWidth / textureWidth;*/

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

    //const squaresXOffset = textureXSquaresOffset * imageSideToTextureSideRatio;
    //const squaresYOffset = textureYSquaresOffset * imageSideToTextureSideRatio;

    const squaresContainer = new Container({
      x: squareTilingModel.squaresContainerRectangle.x,
      y: squareTilingModel.squaresContainerRectangle.y,
      width: squareTilingModel.squaresContainerRectangle.width,
      height: squareTilingModel.squaresContainerRectangle.height
    });
    imageContainer.addChild(squaresContainer);

    //const squareSide = textureSquareSide * imageSideToTextureSideRatio;

    const squareContext = new GraphicsContext()
      .rect(0, 0, squareTilingModel.squareSide, squareTilingModel.squareSide)
      .stroke({
        color: "black",
        width: 2,
        alpha: 0.7
      });

    for (let rowIndex = 0, y = 0;
        rowIndex < squareTilingModel.textureHeightSquareCount;
        rowIndex++, y += squareTilingModel.squareSide) {

      for (let columnIndex = 0, x = 0;
        columnIndex < squareTilingModel.textureWidthSquareCount;
        columnIndex++, x += squareTilingModel.squareSide) {

        const square = new Graphics(squareContext.clone())
        square.position.set(x, y);

        // Протестируем только диагональные элементы
        if (rowIndex == columnIndex) {

          /*const globalSquare = new Graphics()
            .rect(
              columnIndex * textureSquareSide + textureXSquaresOffset,
              rowIndex * textureSquareSide + textureYSquaresOffset,
              textureSquareSide,
              textureSquareSide
            )
            .fill({
              texture,
              textureSpace: "global"
            });
          const squareTexture = app.renderer.generateTexture(globalSquare);*/

          const squareTexture = squareTilingModel.getImageSquareTexture(rowIndex, columnIndex);
          if (squareTexture) {
            square.fill({
              texture: squareTexture,
              textureSpace: "local"
            });
          }
          //globalSquare.destroy();
        }

        squaresContainer.addChild(square);
      }
    }    
    
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
