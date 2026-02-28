import { Color, Container, ContainerChild, ContainerOptions, Graphics } from "pixi.js";
import { ViewportContainer } from "./ViewportContainer";

export class CarouselContainer extends ViewportContainer {
    private backgroundContainer: Container;
    private backgroundFillColor: Color = new Color(0x007700);

    constructor(options?: ContainerOptions<ContainerChild>) {
        super(options);
        this.backgroundContainer = this.createBackground();
    }

    private createBackground(): Container {
        const graphics = new Graphics()
            .rect(
                this.viewportRectangle.x,
                this.viewportRectangle.y,
                this.viewportRectangle.width,
                this.viewportRectangle.height
            )
            .fill({ color: this.backgroundFillColor });
        graphics.cacheAsTexture(true);
        return graphics;
    }

    public onBeforeAddToParent(parent: Container): void {
        if (
            parent
            && this.backgroundContainer
            && !this.backgroundContainer.parent
        ) {
            parent.addChild(this.backgroundContainer);
        }
    }
}