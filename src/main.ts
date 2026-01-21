//import { Application, Assets, Sprite } from "pixi.js";
import { Application, Assets, Container, Graphics } from "pixi.js";

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

    //const textureMinSide = Math.min(textureWidth, textureHeight);
    //const textureMinSideSquareCount = 4;
    //const textureSquareSide = textureMinSide / textureMinSideSquareCount;

    //const textureWidthSquareOffset = (textureWidth - textureMinSide) / 2;
    //const textureHeightSquareOffset = (textureHeight - textureMinSide) / 2;

    const containerWidth = 500;
    const containerHeight = 400;

    let imageWidth = containerWidth;
    let imageHeight = imageWidth / textureWidthToHeightRatio;

    if (imageHeight > containerHeight) {
      imageHeight = containerHeight;
      imageWidth = imageHeight * textureWidthToHeightRatio;
    }

    //let imageSideToTextureSideRatio = imageWidth / textureWidth;

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
