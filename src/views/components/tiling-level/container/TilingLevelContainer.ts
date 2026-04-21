import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Rectangle,
    Renderer,
    Ticker
} from "pixi.js";
import { TilingLevelParameters } from "./TilingLevelParameters.ts";
import { draggingTileData } from "../../../tile-decorators/DraggingTileData.ts";
import { TilingLevelControlContainer } from "../controls/TilingLevelControlContainer.ts";
import { TilingLevelImageContainer } from "../image/TilingLevelImageContainer.ts";
import { TilingLevelCarouselContainer } from "../carousel/TilingLevelCarouselContainer.ts";
import { TilingLevelUniqueParameters } from "./TilingLevelUniqueParameters.ts";
import { EyeHintButton } from "../../hint-button/EyeHintButton.ts";

/**
 * Класс вертикального контейнера уровня мозаичного замощения
 */
export class TilingLevelContainer extends Container {
    private static readonly selectedContainerZIndex: number = 9999;

    private readonly parameters: TilingLevelParameters;
    private readonly uniqueParameters: TilingLevelUniqueParameters;
    private readonly renderer: Renderer;
    private readonly ticker: Ticker;
    /**
     * Границы вертикального контейнера элементов главного вида
     * в пределах родительского элемента
     */
    public readonly boundingRectangle: Rectangle;
    public readonly imageContainerBoundingRectangle: Rectangle;
    public readonly carouselContainerBoundingRectangle: Rectangle;
    public readonly controlContainerBoundingRectangle: Rectangle;

    /**
     * Контейнер, куда временно помещается выбранный пользователем элемент мозаики.
     * В этом контейнере происходит вращение и перемещение фигуры.
     * Должен быть поверх всех элементов в данном контейнере.
     */
    private selectedTileContainer?: Container;
    /**
     * Контейнер, который содержит контейнер области изображения.
     * Располагается в середине
     */
    private imageContainer?: TilingLevelImageContainer;
    /**
     * Контейнер, который содержит контейнер карусели с линией,
     * в которой содержатся элементы мозаики для сборки.
     * Располагается внизу
     */
    private carouselContainer?: TilingLevelCarouselContainer;
    /**
     * Контейнер элементов управления (кнопок и значков).
     * Располагается вверху
     */
    private controlContainer?: TilingLevelControlContainer;

    private boundOnEyeHintButtonWasActivated: () => void
        = this.onEyeHintButtonWasActivated.bind(this);
    private boundOnEyeHintButtonWasDeactivated: () => void
        = this.onEyeHintButtonWasDeactivated.bind(this);

    constructor(
        parameters: TilingLevelParameters,
        uniqueParameters: TilingLevelUniqueParameters,
        renderer: Renderer,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.uniqueParameters = uniqueParameters;
        this.renderer = renderer;
        this.ticker = ticker;

        this.boundingRectangle = this.createBoundingRectangle(options);
        this.controlContainerBoundingRectangle
            = this.createControlContainerBoundingRectangle();
        this.carouselContainerBoundingRectangle
            = this.createCarouselContainerBoundingRectangle();
        this.imageContainerBoundingRectangle
            = this.createImageContainerBoundingRectangle();

        this.initialize();
    }

    /**
     * Инициализация контейнеров-прямых потомков данного контейнера
     */
    private initialize(): void {
        this.selectedTileContainer = this.createSelectedTileContainer();
        if (!this.selectedTileContainer) {
            return;
        }
        this.addChild(this.selectedTileContainer);

        this.imageContainer = this.createImageContainer();
        if (!this.imageContainer) {
            return;
        }
        this.addChild(this.imageContainer);

        this.controlContainer = this.createControlContainer();
        if (!this.controlContainer) {
            return;
        }
        this.addChild(this.controlContainer);

        this.imageContainerAddEventListeners(); 

        this.carouselContainer = this.createCarouselContainer();
        if (!this.carouselContainer) {
            return;
        }
        this.addChild(this.carouselContainer);
    }

    private createBoundingRectangle(options?: ContainerOptions<ContainerChild>): Rectangle {
        return new Rectangle(
            options?.x ?? 0,
            options?.y ?? 0,
            options?.width ?? 0,
            options?.height ?? 0
        );
    }

    private createControlContainerBoundingRectangle(): Rectangle {
        return new Rectangle(
            0,
            0,
            this.boundingRectangle.width,
            Math.min(this.boundingRectangle.width, this.boundingRectangle.height)
                * this.parameters.controlContainerHeightToMinSideRatio
        );
    }

    private createCarouselContainerBoundingRectangle(): Rectangle {
        const padding = this.parameters.carouselParameters.padding;
        const tileLineWidth = this.boundingRectangle.width - padding.left - padding.right;
        const tileLineHeight = tileLineWidth
            * this.parameters.tileLineMaxHeightToTileLineWidthRatio;    
        const maxHeight = Math.min(this.boundingRectangle.width, this.boundingRectangle.height)
            * this.parameters.carouselContainerMaxHeightToMinSideRatio;
        const height = Math.min(tileLineHeight + padding.top + padding.bottom, maxHeight);
        return new Rectangle(
            0,
            this.boundingRectangle.height - height,
            this.boundingRectangle.width,
            height
        );
    }

    private createImageContainerBoundingRectangle(): Rectangle {
        return new Rectangle(
            0,
            this.controlContainerBoundingRectangle.height,
            this.boundingRectangle.width,
            this.boundingRectangle.height
                - this.controlContainerBoundingRectangle.height
                - this.carouselContainerBoundingRectangle.height
        );
    }

    private createSelectedTileContainer(): Container {
        return new Container({
            x: 0,
            y: 0,
            zIndex: TilingLevelContainer.selectedContainerZIndex
        });
    }

    private createImageContainer(): TilingLevelImageContainer {
        return new TilingLevelImageContainer(
            this.parameters.imageParameters,
            this.uniqueParameters.imageParameters,
            this.renderer,
            this.ticker,
            {
                x: this.imageContainerBoundingRectangle.x,
                y: this.imageContainerBoundingRectangle.y,
                width: this.imageContainerBoundingRectangle.width,
                height: this.imageContainerBoundingRectangle.height
            }
        );
    }

    private createControlContainer(): TilingLevelControlContainer {
        return new TilingLevelControlContainer(
            this.parameters.controlParameters,
            this.uniqueParameters.eyeHintButtonIconSvgPath,
            this.uniqueParameters.lampHintButtonIconSvgPath,
            {
                x: this.controlContainerBoundingRectangle.x,
                y: this.controlContainerBoundingRectangle.y,
                width: this.controlContainerBoundingRectangle.width,
                height: this.controlContainerBoundingRectangle.height,
                sortableChildren: true
            }
        );
    }

    private createCarouselContainer(): TilingLevelCarouselContainer | undefined {
        if (!this.selectedTileContainer
            || !this.imageContainer?.tilingView) {
            return undefined;
        }

        return new TilingLevelCarouselContainer(
            this.parameters.carouselParameters,
            this.uniqueParameters.carouselParameters,
            {
                renderer: this.renderer,
                ticker: this.ticker,
                selectedTileContainer: this.selectedTileContainer,
                tilingView: this.imageContainer.tilingView
            },
            {
                x: this.carouselContainerBoundingRectangle.x,
                y: this.carouselContainerBoundingRectangle.y,
                width: this.carouselContainerBoundingRectangle.width,
                height: this.carouselContainerBoundingRectangle.height
            }
        );
    }

    private imageContainerAddEventListeners(): void {
        window.addEventListener(EyeHintButton.wasActivatedEventName,
            this.boundOnEyeHintButtonWasActivated);
        window.addEventListener(EyeHintButton.wasDeactivatedEventName, 
            this.boundOnEyeHintButtonWasDeactivated);
    }

    private imageContainerRemoveEventListeners(): void {
        window.removeEventListener(EyeHintButton.wasActivatedEventName,
            this.boundOnEyeHintButtonWasActivated);
        window.removeEventListener(EyeHintButton.wasDeactivatedEventName, 
            this.boundOnEyeHintButtonWasDeactivated);
    }

    private onEyeHintButtonWasActivated(): void {
        this.imageContainer?.tilingView?.setHintAlphaForStaticTiles();
    }

    private onEyeHintButtonWasDeactivated(): void {
        this.imageContainer?.tilingView?.setDefaultAlphaForStaticTiles();
    }

    private clearDraggingTileData(): void {
        draggingTileData.view = undefined;
        draggingTileData.viewport = undefined;
        draggingTileData.animatingViews.clear();
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        this.clearDraggingTileData();

        if (this.carouselContainer) {
            this.removeChild(this.carouselContainer);  
            this.carouselContainer.destroy();
        }

        if (this.controlContainer) {
            this.removeChild(this.controlContainer);  
            this.controlContainer.destroy();
        }

        if (this.imageContainer) {
            this.imageContainerRemoveEventListeners();
            this.removeChild(this.imageContainer);  
            this.imageContainer.destroy();
        }

        if (this.selectedTileContainer) {
            this.removeChild(this.selectedTileContainer);  
            this.selectedTileContainer.destroy();
        }

        super.destroy(options);
    }
}