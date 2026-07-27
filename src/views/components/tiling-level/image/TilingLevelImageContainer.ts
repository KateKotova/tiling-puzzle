import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Rectangle,
    Renderer,
    Ticker
} from "pixi.js";
import { TilingTextureModel } from "../../../../models/TilingTextureModel.ts";
import { ImageContainerModel } from "../../../../models/ImageContainerModel.ts";
import { TilingModel } from "../../../../models/tilings/TilingModel.ts";
import { RectangularGridTilingModelFactory }
    from "../../../../models/tilings/RectangularGridTilingModelFactory.ts";
import { draggingTileData } from "../../../tile-decorators/DraggingTileData.ts";
import { ZoomAndPanContainer } from "../../zoom-and-pan/ZoomAndPanContainer.ts";
import { TilingView } from "../../../tilings/TilingView.ts";
import { TilingLevelImageParameters } from "./TilingLevelImageParameters.ts";
import { TilingLevelImageUniqueParameters } from "./TilingLevelImageUniqueParameters.ts";
import { Size } from "../../../../math/Size.ts";
import { EyeHintButton } from "../../hint-button/EyeHintButton.ts";

/**
 * Класс контейнера изображения для сборки мозаики,
 * которое должно находиться в вертикальном контейнере уровня мозаичного замощения
 */
export class TilingLevelImageContainer extends Container {
    private readonly parameters: TilingLevelImageParameters;
    private readonly uniqueParameters: TilingLevelImageUniqueParameters;
    private readonly renderer: Renderer;
    private readonly ticker: Ticker;

    private readonly size: Size;
    private readonly innerContainerBoundingRectangle: Rectangle;

    /**
     * Внутренний контейнер, который отстоит от данного контейнера
     * на величину внутренних отступов
     */
    private innerContainer?: Container;
    /**
     * Контейнера-viewport-а изображения с возможностью масштабирования и панорамирования
     */
    private zoomAndPanContainer?: ZoomAndPanContainer;
    /**
     * Контейнер изображения
     */
    private imageContainer?: Container;
    /**
     * Изображение
     */
    private image?: Graphics;
    /**
     * Представление замощения
     */
    public tilingView?: TilingView;

    //#region Тестовые данные

    /**
     * Тестовое изображение, отображающее фон контейнера области изображения
     */
    private background?: Graphics;

    //#endregion Тестовые данные

    private tilingTextureModel?: TilingTextureModel;
    private imageContainerModel?: ImageContainerModel;
    private tilingModel?: TilingModel;

    private boundOnEyeHintButtonWasActivated: () => void
        = this.onEyeHintButtonWasActivated.bind(this);
    private boundOnEyeHintButtonWasDeactivated: () => void
        = this.onEyeHintButtonWasDeactivated.bind(this);

    constructor(
        parameters: TilingLevelImageParameters,
        uniqueParameters: TilingLevelImageUniqueParameters,
        renderer: Renderer,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.uniqueParameters = uniqueParameters;
        this.renderer = renderer;
        this.ticker = ticker;

        this.size = new Size(options?.width ?? 0, options?.height ?? 0);
        this.innerContainerBoundingRectangle = this.createInnerContainerBoundingRectangle();

        this.initialize();
    }

    private initialize(): void {
        this.innerContainer = this.createInnerContainer();
        if (!this.innerContainer) {
            return;
        }
        this.addChild(this.innerContainer);

        this.background = this.createBackground();
        if (!this.background) {
            return;
        }
        this.innerContainer.addChild(this.background);

        this.tilingTextureModel = new TilingTextureModel(
            this.uniqueParameters.tilingTexture);
        this.imageContainerModel = new ImageContainerModel(
            this.tilingTextureModel,
            this.innerContainerBoundingRectangle.width,
            this.innerContainerBoundingRectangle.height
        );

        this.zoomAndPanContainer = this.createZoomAndPanContainer();
        if (!this.zoomAndPanContainer) {
            return;
        }
        this.innerContainer.addChild(this.zoomAndPanContainer);
        this.zoomAndPanContainer.onAddedToParent();
        draggingTileData.viewport = this.zoomAndPanContainer;
        this.zoomAndPanContainer.onDestroy = (): void => {
            draggingTileData.viewport = undefined;
        };

        this.imageContainer = this.createImageContainer();
        if (!this.imageContainer) {
            return;
        }
        this.zoomAndPanContainer.addChild(this.imageContainer);

        this.image = this.createImage();
        if (!this.image) {
            return;
        }
        this.imageContainer.addChild(this.image);

        this.tilingModel = this.createTilingModel();
        if (!this.tilingModel) {
            return;
        }
        this.tilingModel.setShuffledTilePositions(
            this.uniqueParameters.tilingLayoutStrategyType);

        this.tilingView = new TilingView(
            this.parameters.tilingParameters,
            this.tilingModel,
            this.uniqueParameters.defaultStaticTileFillColor,
            this.uniqueParameters.targetStaticTileFillColor
        );
        draggingTileData.tilingView = this.tilingView;
        this.tilingView.onDestroy = (): void => {
            draggingTileData.tilingView = undefined;
        };

        this.tilingView.createStaticTileViews(this.renderer, this.ticker);
        this.imageContainer.addChild(this.tilingView.tilingContainer);
        this.zoomAndPanContainer.setContentSize(
            this.imageContainerModel.width,
            this.imageContainerModel.height
        );
        this.zoomAndPanContainer.getShouldPreventEvents = (): boolean => {
            return !!draggingTileData?.animatingViews.size;
        };

        this.addEventListeners(); 
    }

    private createInnerContainerBoundingRectangle(): Rectangle {
        const padding = this.parameters.padding;
        return new Rectangle(
            padding.left,
            padding.top,
            this.size.width - padding.left - padding.right,
            this.size.height - padding.top - padding.bottom
        );
    }

    private createInnerContainer(): Container | undefined {
        return new Container({
            x: this.innerContainerBoundingRectangle.x,
            y: this.innerContainerBoundingRectangle.y
        });
    }

    private createTilingModel(): TilingModel | undefined {
        if (!this.tilingTextureModel || !this.imageContainerModel) {
            return undefined;
        }

        return new RectangularGridTilingModelFactory().getTilingModel(
            this.parameters.tileModelParameters,
            this.uniqueParameters.tilingType,
            this.uniqueParameters.textureMinSideTileCount,
            this.tilingTextureModel,
            this.imageContainerModel,
            this.renderer
        );
    }

    private createZoomAndPanContainer(): ZoomAndPanContainer | undefined {
        if (!this.innerContainer || !this.imageContainerModel) {
            return undefined;
        }

        return new ZoomAndPanContainer(      
            this.parameters.zoomAndPanParameters,
            {
                x: (this.innerContainerBoundingRectangle.width
                    - this.imageContainerModel.width) / 2.0,
                y: (this.innerContainerBoundingRectangle.height
                    - this.imageContainerModel.height) / 2.0,
                width: this.imageContainerModel.width,
                height: this.imageContainerModel.height,
            }
        );
    }

    private createImageContainer(): Container | undefined {
        if (!this.imageContainerModel) {
            return undefined;
        }

        return new Container({
            x: 0,
            y: 0,
            width: this.imageContainerModel.width,
            height: this.imageContainerModel.height,
        });
    }

    private createImage(): Graphics | undefined {
        if (!this.imageContainerModel) {
            return undefined;
        }

        const graphics = new Graphics()
            .rect(0, 0, this.imageContainerModel.width, this.imageContainerModel.height)
            .fill({
                texture: this.uniqueParameters.tilingTexture,
                textureSpace: "local",
                alpha: 1
            });
        graphics.cacheAsTexture(true);
        return graphics;
    }

    private addEventListeners(): void {
        window.addEventListener(EyeHintButton.wasActivatedEventName,
            this.boundOnEyeHintButtonWasActivated);
        window.addEventListener(EyeHintButton.wasDeactivatedEventName, 
            this.boundOnEyeHintButtonWasDeactivated);
    }

    private removeEventListeners(): void {
        window.removeEventListener(EyeHintButton.wasActivatedEventName,
            this.boundOnEyeHintButtonWasActivated);
        window.removeEventListener(EyeHintButton.wasDeactivatedEventName, 
            this.boundOnEyeHintButtonWasDeactivated);
    }

    private onEyeHintButtonWasActivated(): void {
        this.tilingView?.setHintAlphaForStaticTiles();
    }

    private onEyeHintButtonWasDeactivated(): void {
        this.tilingView?.setDefaultAlphaForStaticTiles();
    }

    //#region Тестовые данные

    private createBackground(): Graphics | undefined {
        if (!this.innerContainer) {
            return undefined;
        }

        const graphics = new Graphics()
            .rect(
                0,
                0,
                this.innerContainerBoundingRectangle.width,
                this.innerContainerBoundingRectangle.height
            )
            .fill({ color: "green" });
        graphics.eventMode = 'none';
        graphics.interactiveChildren = false;
        graphics.cacheAsTexture(true);
        return graphics;
    }

    //#endregion Тестовые данные

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        this.removeEventListeners();

        if (this.tilingView) {
            this.imageContainer?.removeChild(this.tilingView.tilingContainer);  
            this.tilingView.destroy();
        }

        if (this.image) {
            this.imageContainer?.removeChild(this.image);  
            this.image.cacheAsTexture(false);
            this.image.destroy();
        }

        if (this.imageContainer) {
            this.zoomAndPanContainer?.removeChild(this.imageContainer);  
            this.imageContainer.destroy();
        }

        if (this.zoomAndPanContainer) {
            this.innerContainer?.removeChild(this.zoomAndPanContainer);  
            this.zoomAndPanContainer.destroy();
        }

        if (this.background) {
            this.innerContainer?.removeChild(this.background);  
            this.background.cacheAsTexture(false);
            this.background.destroy();
        }

        if (this.innerContainer) {
            this.removeChild(this.innerContainer);  
            this.innerContainer.destroy();
        }

        super.destroy(options);
    }
}