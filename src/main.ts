//import { Application, Assets, Sprite } from "pixi.js";
import { Application, Assets, Container, GraphicsContext, Graphics } from "pixi.js";

async function main(): Promise<void> {
  try {
    const app = new Application();
    await app.init({ background: "#1099bb", resizeTo: window });
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    await Assets.load({
      alias: "example-image",
      src: "assets/horse-example-image.png",
    });

    const texture = Assets.get("example-image");
    const textureWidth = texture.width;
    const textureHeight = texture.height;
    const textureWidthToHeightRatio = textureWidth / textureHeight;

    const textureMinSide = Math.min(textureWidth, textureHeight);
    const textureMinSideSquareCount = 5;
    const textureSquareSide = textureMinSide / textureMinSideSquareCount;

    const textureWidthSquareCount = Math.trunc(textureWidth / textureSquareSide);
    const textureHeightSquareCount = Math.trunc(textureHeight / textureSquareSide);    

    const textureXSquaresOffset = (textureWidth - textureSquareSide * textureWidthSquareCount) / 2;
    const textureYSquaresOffset = (textureHeight - textureSquareSide * textureHeightSquareCount) / 2;

    const containerWidth = 500;
    const containerHeight = 400;

    let imageWidth = containerWidth;
    let imageHeight = imageWidth / textureWidthToHeightRatio;

    if (imageHeight > containerHeight) {
      imageHeight = containerHeight;
      imageWidth = imageHeight * textureWidthToHeightRatio;
    }

    const imageSideToTextureSideRatio = imageWidth / textureWidth;

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
      x: containerCenterX - imageWidth / 2,
      y: containerCenterY - imageHeight / 2,
      width: imageWidth,
      height: imageHeight,
    });
    container.addChild(imageContainer);

    const image = new Graphics()
      .rect(0, 0, imageWidth, imageHeight)
      .fill({
        texture,
        textureSpace: "local",
        alpha: 0.5
      });
    imageContainer.addChild(image);

    const squaresXOffset = textureXSquaresOffset * imageSideToTextureSideRatio;
    const squaresYOffset = textureYSquaresOffset * imageSideToTextureSideRatio;

    const squaresContainer = new Container({
      x: squaresXOffset,
      y: squaresYOffset,
      width: imageWidth - squaresXOffset * 2,
      height: imageHeight - squaresYOffset * 2,
    });
    imageContainer.addChild(squaresContainer);

    const squareSide = textureSquareSide * imageSideToTextureSideRatio;

    const squareContext = new GraphicsContext()
      .rect(0, 0, squareSide, squareSide)
      .stroke({
        color: "black",
        width: 2,
        alpha: 0.7
      });

    for (let rowIndex = 0, y = 0;
        rowIndex < textureHeightSquareCount;
        rowIndex++, y += squareSide) {

      for (let columnIndex = 0, x = 0;
        columnIndex < textureWidthSquareCount;
        columnIndex++, x += squareSide) {

        const square = new Graphics(squareContext);
        square.x = x;
        square.y = y;
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
