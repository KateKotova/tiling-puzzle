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
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { HintButton } from "./HintButton.ts";
import { TilingLevelControlContainer } from "./TilingLevelControlContainer.ts";
import { TilingLevelImageContainer } from "./TilingLevelImageContainer.ts";
import { TilingLevelCarouselContainer } from "./TilingLevelCarouselContainer.ts";
import { TilingLevelUniqueParameters } from "./TilingLevelUniqueParameters.ts";

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
    public readonly controlContainerHeight: number;
    public readonly carouselContainerHeight: number;

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

    private boundOnHintButtonWasActivated: () => void
        = this.onHintButtonWasActivated.bind(this);
    private boundOnHintButtonWasDeactivated: () => void
        = this.onHintButtonWasDeactivated.bind(this);

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
        this.controlContainerHeight = this.boundingRectangle.height
            * this.parameters.controlContainerHeightToHeightRatio;
        this.carouselContainerHeight = this.boundingRectangle.height
            * this.parameters.carouselContainerHeightToHeightRatio;

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

    private createSelectedTileContainer(): Container {
        return new Container({
            x: 0,
            y: 0,
            width: this.boundingRectangle.width,
            height: this.boundingRectangle.height,
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
                x: 0,
                y: this.controlContainerHeight,
                width: this.boundingRectangle.width,
                height: this.boundingRectangle.height
                    - this.controlContainerHeight
                    - this.carouselContainerHeight
            }
        );
    }

    private createControlContainer(): TilingLevelControlContainer {
        return new TilingLevelControlContainer(
            this.parameters.controlParameters,
            this.renderer,
            this.uniqueParameters.hintButtonIconSvgPath,
            {
                x: 0,
                y: 0,
                width: this.boundingRectangle.width,
                height: this.controlContainerHeight,
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
                x: 0,
                y: this.boundingRectangle.height - this.carouselContainerHeight,
                width: this.boundingRectangle.width,
                height: this.carouselContainerHeight
            }
        );
    }

    private imageContainerAddEventListeners(): void {
        window.addEventListener(HintButton.hintButtonWasActivatedEventName,
            this.boundOnHintButtonWasActivated);
        window.addEventListener(HintButton.hintButtonWasDeactivatedEventName, 
            this.boundOnHintButtonWasDeactivated);
    }

    private imageContainerRemoveEventListeners(): void {
        window.removeEventListener(HintButton.hintButtonWasActivatedEventName,
            this.boundOnHintButtonWasActivated);
        window.removeEventListener(HintButton.hintButtonWasDeactivatedEventName, 
            this.boundOnHintButtonWasDeactivated);
    }

    private onHintButtonWasActivated(): void {
        this.imageContainer?.tilingView?.setHintAlphaForStaticTiles();
    }

    private onHintButtonWasDeactivated(): void {
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