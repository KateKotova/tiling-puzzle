import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Renderer,
    Ticker
} from "pixi.js";
import { draggingTileData } from "../../../tile-decorators/DraggingTileData.ts";
import { TileLineContainer } from "../../tile-line/TileLineContainer.ts";
import { TileLineDirectionType } from "../../tile-line/TileLineDirectionType.ts";
import { TileLineLayoutType } from "../../tile-line/TileLineLayoutType.ts";
import { CarouselContainer } from "../../carousel/CarouselContainer.ts";
import { CarouselDirectionType } from "../../carousel/CarouselDirectionType.ts";
import { DraggableTileView } from "../../../tile-decorators/DraggableTileView.ts";
import { TilingLevelCarouselParameters } from "./TilingLevelCarouselParameters.ts";
import { TilingLevelCarouselUniqueParameters }
    from "./TilingLevelCarouselUniqueParameters.ts";
import { TilingView } from "../../../tilings/TilingView.ts";
import { TilingLevelCarouselCreationParameters }
    from "./TilingLevelCarouselCreationParameters.ts";
import { Size } from "../../../../math/Size.ts";

/**
 * Класс вертикального контейнера карусели линии,
 * в которой содержатся элементы мозаики для сборки
 * и которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export class TilingLevelCarouselContainer extends Container {
    private readonly parameters: TilingLevelCarouselParameters;
    private readonly uniqueParameters: TilingLevelCarouselUniqueParameters;
    private readonly renderer: Renderer;
    private readonly ticker: Ticker;
    private readonly size: Size;
    /**
     * Контейнер, куда временно помещается выбранный пользователем элемент мозаики.
     * В этом контейнере происходит вращение и перемещение фигуры.
     */
    private readonly selectedTileContainer: Container;
    /**
     * Представление замощения
     */
    private readonly tilingView: TilingView;

    /**
     * Контейнер линии, в которой содержатся элементы мозаики для сборки
     */
    public tileLineContainer?: TileLineContainer;
    /**
     * Карусель с инерционной прокруткой, содержащая контейнер линии с фигурами
     */
    private carouselContainer?: CarouselContainer;

    private boundOnTileLineContainerStartResize: () => void
        = this.onTileLineContainerStartResize.bind(this);
    private boundTileLineContainerStopResize: () => void
        = this.onTileLineContainerStopResize.bind(this);
    private boundOnDraggingTileWasSelected: () => void
        = this.onDraggingTileWasSelected.bind(this);

    constructor(
        parameters: TilingLevelCarouselParameters,
        uniqueParameters: TilingLevelCarouselUniqueParameters,
        creationParameters: TilingLevelCarouselCreationParameters,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.uniqueParameters = uniqueParameters;
        this.renderer = creationParameters.renderer;
        this.ticker = creationParameters.ticker;
        this.selectedTileContainer = creationParameters.selectedTileContainer;
        this.tilingView = creationParameters.tilingView;
        this.size = new Size(options?.width ?? 0, options?.height ?? 0);
        this.initialize();
    }

    private initialize(): void {
        this.tileLineContainer = this.createTileLineContainer();
        if (!this.tileLineContainer) {
            return;
        }
        
        this.carouselContainer = this.createCarouselContainer();
        if (!this.carouselContainer) {
            return;
        }

        this.carouselContainer.onBeforeAddToParent(this);
        this.addChild(this.carouselContainer);
        this.carouselContainer.onAddedToParent();

        this.carouselContainer.addChild(this.tileLineContainer);
        this.tileLineContainer.onAddedToParent(this.carouselContainer);

        const tileLineContainerSize = this.tileLineContainer.getSizeByDirection();
        this.carouselContainer.setContentSize(tileLineContainerSize.width,
            tileLineContainerSize.height);
            
        this.carouselContainer.getShouldPreventEvents = () => !!draggingTileData.view;
        this.carouselContainerAddEventListeners();
    }

    private createTileLineContainer(): TileLineContainer {
        const transverseSize = this.size.height
            - this.parameters.padding.top
            - this.parameters.padding.bottom;

        const result = new TileLineContainer(
            this.parameters.tileLineParameters,
            {
                directionType: TileLineDirectionType.FromLeftToRight,
                layoutType: TileLineLayoutType.Bottom,
                transverseSize,      
                tilingView: this.tilingView,
                selectedTileContainer: this.selectedTileContainer,
                ticker: this.ticker,
                backgroundFillColor: this.uniqueParameters.tileLineBackgroundFillColor
            }
        );
        result.createDraggableTileViews(this.renderer, this.ticker);
        return result;
    }

    private createCarouselContainer(): CarouselContainer | undefined {
        const padding = this.parameters.padding;
        return new CarouselContainer(
            this.parameters.carouselParameters,
            CarouselDirectionType.Horizontal,
            this.ticker,
            this.uniqueParameters.carouselBackgroundFillColor,
            {
                x: padding.left,
                y: padding.top,
                width: this.size.width - padding.left - padding.right,
                height: this.size.height - padding.top - padding.bottom
            }
        );
    }

    private carouselContainerAddEventListeners(): void {
        window.addEventListener(TileLineContainer.tileLineStartResizeEventName,
            this.boundOnTileLineContainerStartResize);
        window.addEventListener(TileLineContainer.tileLineStopResizeEventName, 
            this.boundTileLineContainerStopResize);
        window.addEventListener(DraggableTileView.draggingTileWasSelectedEventName, 
            this.boundOnDraggingTileWasSelected);
    }

    private carouselContainerRemoveEventListeners(): void {
        window.removeEventListener(TileLineContainer.tileLineStartResizeEventName,
            this.boundOnTileLineContainerStartResize);
        window.removeEventListener(TileLineContainer.tileLineStopResizeEventName, 
            this.boundTileLineContainerStopResize);
        window.removeEventListener(DraggableTileView.draggingTileWasSelectedEventName, 
            this.boundOnDraggingTileWasSelected);
    }

    private onTileLineContainerStartResize(): void {
        this.carouselContainer?.setOnPointerDownActivity(false);
    }

    private onTileLineContainerStopResize(): void {
        this.carouselContainer?.setOnPointerDownActivity(true);
    }

    private onDraggingTileWasSelected(): void {
        this.carouselContainer?.stopInertia();
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        if (this.tileLineContainer) {
            this.carouselContainer?.removeChild(this.tileLineContainer);  
            this.tileLineContainer.destroy();
        }

        if (this.carouselContainer) {
            this.carouselContainerRemoveEventListeners();
            this.carouselContainer.getShouldPreventEvents = () => false;
            this.removeChild(this.carouselContainer);  
            this.carouselContainer.destroy();
        }

        super.destroy(options);
    }
}