//import { Application, Assets, Sprite } from "pixi.js";
import {
  Application,
  Assets,
  Container,
  Graphics,
  GraphicsContext,
  Matrix,
  Rectangle,
  RenderTexture,
  Texture,
  Sprite
} from "pixi.js";

async function main(): Promise<void> {
  try {
    const app = new Application();
    globalThis.__PIXI_APP__ = app;
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

    const textureWidthToTextureSquareSideRatio = textureWidth / textureSquareSide;
    const textureHeightToTextureSquareSideRatio = textureHeight / textureSquareSide;

    const textureWidthSquareCount = Math.trunc(textureWidthToTextureSquareSideRatio);
    const textureHeightSquareCount = Math.trunc(textureHeightToTextureSquareSideRatio);    

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


    const textureWidthToSquareSideRatio = textureWidth / squareSide;
    const textureHeightToSquareSideRatio = textureHeight / squareSide;

    const squareMatrix = new Matrix()
      .scale(textureWidthToSquareSideRatio,
        textureHeightToSquareSideRatio)
      .translate(textureXSquaresOffset,
        textureYSquaresOffset);

    console.log(squareMatrix)

    

    for (let rowIndex = 0, y = 0;
        rowIndex < textureHeightSquareCount;
        rowIndex++, y += squareSide) {

      for (let columnIndex = 0, x = 0;
        columnIndex < textureWidthSquareCount;
        columnIndex++, x += squareSide) {

        const square = new Graphics(squareContext.clone());

        // Протестируем только диагональные элементы
        if (rowIndex == columnIndex) {

          const matrix = new Matrix()
          //   textureWidthToSquareSideRatio * imageSideToTextureSideRatio,
          //   0,
          //   0,
          //   textureHeightToSquareSideRatio * imageSideToTextureSideRatio,
          //   (columnIndex * textureSquareSide + textureXSquaresOffset) * imageSideToTextureSideRatio,
          //   (rowIndex * textureSquareSide + textureYSquaresOffset) * imageSideToTextureSideRatio
          // );
            .scale(
              textureWidthToSquareSideRatio * imageSideToTextureSideRatio,
              textureHeightToSquareSideRatio * imageSideToTextureSideRatio
            )
            .translate(
              (columnIndex * textureSquareSide + textureXSquaresOffset) * imageSideToTextureSideRatio,
              (rowIndex * textureSquareSide + textureYSquaresOffset) * imageSideToTextureSideRatio
            );

          const globalSquare = new Graphics()
            .rect(
              (columnIndex * textureSquareSide + textureXSquaresOffset),
              (rowIndex * textureSquareSide + textureYSquaresOffset),
              textureSquareSide,
              textureSquareSide
            )
            .fill({
              //matrix,
              texture,
              textureSpace: "global"
            });
          const squareTexture = app.renderer.generateTexture(globalSquare);

          /*const squareTextureSprite = new Sprite({
            x: 0,
            y: 0,
            width: textureSquareSide,
            height: textureSquareSide,
            texture: new Texture({
              source: texture,
              orig: new Rectangle(
                columnIndex * textureSquareSide + textureXSquaresOffset,
                rowIndex * textureSquareSide + textureYSquaresOffset,
                textureSquareSide,
                textureSquareSide
              )
            })
          });
          //squareTextureSprite.scale = imageSideToTextureSideRatio;

          const squareTexture = app.renderer.generateTexture(squareTextureSprite);*/

          square.fill({
            //matrix: matrix,                
            // texture: new Texture({
            //   source: texture,
            //   trim: new Rectangle(
            //     columnIndex * textureSquareSide + textureXSquaresOffset,
            //     rowIndex * textureSquareSide + textureYSquaresOffset,
            //     textureSquareSide,
            //     textureSquareSide
            //   )
            // }),
            texture: squareTexture,
            textureSpace: "local",
            alpha: 0.8
          });
          globalSquare.destroy();
          console.log(square.fillStyle.matrix)
        }

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
