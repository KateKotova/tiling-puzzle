import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Point,
    Rectangle,
    Renderer,
    Ticker
} from "pixi.js";
import { TilingTextureModel } from "../../models/TilingTextureModel.ts";
import { TilingLevelParameters } from "./TilingLevelParameters.ts";
import { ImageContainerModel } from "../../models/ImageContainerModel.ts";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { RectangularGridTilingModelFactory }
    from "../../models/tilings/RectangularGridTilingModelFactory.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { ZoomAndPanContainer } from "./ZoomAndPanContainer.ts";
import { TilingView } from "../tilings/TilingView.ts";
import { TileLineContainer } from "./TileLineContainer.ts";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";
import { TileLineLayoutType } from "./TileLineLayoutType.ts";
import { CarouselContainer } from "./CarouselContainer.ts";
import { CarouselDirectionType } from "./CarouselDirectionType.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { HintButton } from "./HintButton.ts";

/**
 * Класс вертикального контейнера уровня мозаичного замощения
 */
export class TilingLevelContainer extends Container {
    private static readonly selectedContainerZIndex: number = 9999;

    private readonly parameters: TilingLevelParameters;
    private readonly renderer: Renderer;
    private readonly ticker: Ticker;
    /**
     * Границы вертикального контейнера элементов главного вида
     * в пределах родительского элемента
     */
    public readonly boundingRectangle: Rectangle;

    /**
     * Контейнер, куда временно помещается выбранный пользователем элемент мозаики.
     * В этом контейнере происходит вращение и перемещение фигуры.
     * Должен быть поверх всех элементов в данном контейнере.
     */
    private selectedTileContainer?: Container;
    /**
     * Контейнер элементов управления (кнопок и значков).
     * Располагается вверху
     */
    private controlContainer?: Container;
    /**
     * Контейнер, который содержит контейнер карусели с линией,
     * в которой содержатся элементы мозаики для сборки.
     * Располагается внизу
     */
    private tileLineCarouselParentContainer?: Container;
    /**
     * Контейнер, который содержит контейнер области изображения.
     * Располагается в середине
     */
    private imageAreaParentContainer?: Container;

    /**
     * Контейнер области изображения
     */
    private imageAreaContainer?: Container;
    /**
     * Контейнера-viewport-а изображения с возможностью масштабирования и панорамирования
     */
    private imageZoomAndPanContainer?: ZoomAndPanContainer;
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
    private tilingView?: TilingView;

    /**
     * Контейнер линии, в которой содержатся элементы мозаики для сборки
     */
    private tileLineContainer?: TileLineContainer;
    /**
     * Карусель с инерционной прокруткой, содержащая контейнер линии с фигурами
     */
    private tileLineCarouselContainer?: CarouselContainer;

    /**
     * Кнопка подсказки
     */
    private hintButton?: HintButton;

    //#region Тестовые данные

    /**
     * Тестовое изображение, отображающее фон контейнера области изображения
     */
    private imageAreaBackground?: Graphics;

    //#endregion Тестовые данные

    private tilingTextureModel?: TilingTextureModel;
    private imageContainerModel?: ImageContainerModel;
    private tilingModel?: TilingModel;

    private boundOnTileLineContainerStartResize: () => void
        = this.onTileLineContainerStartResize.bind(this);
    private boundTileLineContainerStopResize: () => void
        = this.onTileLineContainerStopResize.bind(this);
    private boundOnDraggingTileWasSelected: () => void
        = this.onDraggingTileWasSelected.bind(this);

    private boundOnHintButtonWasActivated: () => void
        = this.onHintButtonWasActivated.bind(this);
    private boundOnHintButtonWasDeactivated: () => void
        = this.onHintButtonWasDeactivated.bind(this);

    constructor(
        parameters: TilingLevelParameters,
        renderer: Renderer,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.renderer = renderer;
        this.ticker = ticker;

        this.boundingRectangle = this.createBoundingRectangle(options);
        this.initializeDirectChildContainers();
        this.initializeImageAreaContainers();
        this.initializeTileLineCarouselContainers();
        this.initializeControlChildContainers();
    }

    //#region Инициализация

    /**
     * Инициализация контейнеров-прямых потомков данного контейнера
     */
    private initializeDirectChildContainers(): void {
        this.selectedTileContainer = this.createSelectedTileContainer();
        this.addChild(this.selectedTileContainer);

        this.controlContainer = this.createControlContainer();
        this.addChild(this.controlContainer);

        this.tileLineCarouselParentContainer = this.createTileLineCarouselParentContainer();
        this.addChild(this.tileLineCarouselParentContainer);

        this.imageAreaParentContainer = this.createImageAreaParentContainer();
        this.addChild(this.imageAreaParentContainer);
    }

    private initializeImageAreaContainers(): void {
        this.imageAreaContainer = this.createImageAreaContainer();
        if (!this.imageAreaContainer) {
            return;
        }
        this.imageAreaParentContainer?.addChild(this.imageAreaContainer);

        this.imageAreaBackground = this.createImageAreaBackground();
        if (!this.imageAreaBackground) {
            return;
        }
        this.imageAreaContainer.addChild(this.imageAreaBackground);

        this.tilingTextureModel = new TilingTextureModel(this.parameters.tilingTexture);
        this.imageContainerModel = new ImageContainerModel(this.tilingTextureModel,
            this.imageAreaContainer.width, this.imageAreaContainer.height);

        this.imageZoomAndPanContainer = this.createImageZoomAndPanContainer();
        if (!this.imageZoomAndPanContainer) {
            return;
        }
        this.imageAreaContainer.addChild(this.imageZoomAndPanContainer);
        this.imageZoomAndPanContainer.onAddedToParent();
        draggingTileData.viewport = this.imageZoomAndPanContainer;
        this.imageZoomAndPanContainer.onDestroy = (): void => {
            draggingTileData.viewport = undefined;
        };

        this.imageContainer = this.createImageContainer();
        if (!this.imageContainer) {
            return;
        }
        this.imageZoomAndPanContainer.addChild(this.imageContainer);

        this.image = this.createImage();
        if (!this.image) {
            return;
        }
        this.imageContainer.addChild(this.image);

        this.tilingModel = this.createTilingModel();
        if (!this.tilingModel) {
            return;
        }
        this.tilingModel.setShuffledTilePositions(this.parameters.tilingLayoutStrategyType);

        this.tilingView = new TilingView(
            this.parameters.tilingParameters,
            this.tilingModel,
            this.parameters.defaultStaticTileFillColor,
            this.parameters.targetStaticTileFillColor
        );

        this.tilingView.createStaticTileViews(this.renderer, this.ticker);
        this.imageContainer.addChild(this.tilingView.tilingContainer);
        this.imageZoomAndPanContainer.setContentSize(
            this.imageContainerModel.width,
            this.imageContainerModel.height
        );
        this.imageZoomAndPanContainer.getShouldPreventEvents = (): boolean => {
            return !!draggingTileData?.animatingViews.size;
        };
    }

    private initializeTileLineCarouselContainers(): void {
        if (!this.tileLineCarouselParentContainer) {
            return;
        }

        this.tileLineContainer = this.createTileLineContainer();
        if (!this.tileLineContainer) {
            return;
        }
        
        this.tileLineCarouselContainer = this.createTileLineCarouselContainer();
        if (!this.tileLineCarouselContainer) {
            return;
        }

        this.tileLineCarouselContainer.onBeforeAddToParent(
            this.tileLineCarouselParentContainer);
        this.tileLineCarouselParentContainer.addChild(this.tileLineCarouselContainer);
        this.tileLineCarouselContainer.onAddedToParent();

        this.tileLineCarouselContainer.addChild(this.tileLineContainer);
        this.tileLineContainer.onAddedToParent(this.tileLineCarouselContainer);

        const tileLineContainerSize = this.tileLineContainer.getSizeByDirection();
        this.tileLineCarouselContainer.setContentSize(tileLineContainerSize.width,
            tileLineContainerSize.height);
            
        this.tileLineCarouselContainer.getShouldPreventEvents = () => !!draggingTileData.view;
        this.tileLineCarouselContainerAddEventListeners();
    }

    private initializeControlChildContainers(): void {
        if (!this.controlContainer) {
            return;
        }

        this.hintButton = this.createHintButton();
        if (!this.hintButton) {
            return;
        }
        this.controlContainer.addChild(this.hintButton);

        this.tilingViewAddEventListeners();
    }

    //#endregion Инициализация

    //#region Контейнеры-прямые потомки данного контейнера

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

    private createControlContainer(): Container {
        return new Container({
            x: 0,
            y: 0,
            width: this.boundingRectangle.width,
            height: this.boundingRectangle.height
                * this.parameters.controlContainerHeightToHeightRatio,
            sortableChildren: true
        });
    }

    private createTileLineCarouselParentContainer(): Container {
        const resultHeight = this.boundingRectangle.height
            * this.parameters.tileLineCarouselParentContainerHeightToHeightRatio;
        return new Container({
            x: 0,
            y: this.boundingRectangle.height - resultHeight,
            width: this.boundingRectangle.width,
            height: resultHeight
        });
    }

    private createImageAreaParentContainer(): Container {
        return new Container({
            x: 0,
            y: this.controlContainer?.height ?? 0,
            width: this.boundingRectangle.width,
            height: this.boundingRectangle.height
                - (this.controlContainer?.height ?? 0)
                - (this.tileLineCarouselParentContainer?.height ?? 0)
        });
    }

    //#endregion Контейнеры-прямые потомки потомков данного контейнера

    //#region Контейнеры области изображения

    private createImageAreaContainer(): Container | undefined {
        if (!this.imageAreaParentContainer) {
            return undefined;
        }

        const padding = this.parameters.imageAreaParentContainerPadding;
        return new Container({
            x: padding.left,
            y: padding.top,
            width: this.imageAreaParentContainer.width
                - padding.left
                - padding.right,
            height: this.imageAreaParentContainer.height
                - padding.top
                - padding.bottom
        });
    }

    private createTilingModel(): TilingModel | undefined {
        if (!this.tilingTextureModel || !this.imageContainerModel) {
            return undefined;
        }

        return new RectangularGridTilingModelFactory().getTilingModel(
            this.parameters.tileModelParameters,
            this.parameters.tilingType,
            this.parameters.textureMinSideTileCount,
            this.tilingTextureModel,
            this.imageContainerModel,
            this.renderer
        );
    }

    private createImageZoomAndPanContainer(): ZoomAndPanContainer | undefined {
        if (!this.imageAreaContainer || !this.imageContainerModel) {
            return undefined;
        }

        return new ZoomAndPanContainer(      
            this.parameters.imageZoomAndPanParameters,
            {
                x: (this.imageAreaContainer.width - this.imageContainerModel.width) / 2.0,
                y: (this.imageAreaContainer.height - this.imageContainerModel.height) / 2.0,
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
                texture: this.parameters.tilingTexture,
                textureSpace: "local",
                alpha: 1
            });
        graphics.cacheAsTexture(true);
        return graphics;
    }

    //#endregion Контейнеры области изображения

    //#region Контейнеры карусели линии с фигурами

    private createTileLineContainer(): TileLineContainer | undefined {
        if (
            !this.tileLineCarouselParentContainer
            || !this.tilingView
            || !this.selectedTileContainer
        ) {
            return undefined;
        }

        const transverseSize = this.tileLineCarouselParentContainer.height
            - this.parameters.tileLineCarouselParentContainerPadding.top
            - this.parameters.tileLineCarouselParentContainerPadding.bottom;

        const result = new TileLineContainer(
            this.parameters.tileLineParameters,
            {
                directionType: TileLineDirectionType.FromLeftToRight,
                layoutType: TileLineLayoutType.Bottom,
                transverseSize,      
                tilingView: this.tilingView,
                selectedTileContainer: this.selectedTileContainer,
                ticker: this.ticker,
                backgroundFillColor: this.parameters.tileLineContainerBackgroundFillColor
            }
        );
        result.createDraggableTileViews(this.renderer, this.ticker);
    }

    private createTileLineCarouselContainer(): CarouselContainer | undefined {
        if (!this.tileLineCarouselParentContainer) {
            return;
        }

        const parentPadding = this.parameters.tileLineCarouselParentContainerPadding;
        return new CarouselContainer(
            this.parameters.tileLineCarouselParameters,
            CarouselDirectionType.Horizontal,
            this.ticker,
            {
                x: parentPadding.left,
                y: parentPadding.top,
                width: this.tileLineCarouselParentContainer.width
                    - parentPadding.left
                    - parentPadding.right,
                height: this.tileLineCarouselParentContainer.height
                    - parentPadding.top
                    - parentPadding.bottom
            }
        );
    }

    private tileLineCarouselContainerAddEventListeners(): void {
        window.addEventListener(TileLineContainer.tileLineStartResizeEventName,
            this.boundOnTileLineContainerStartResize);
        window.addEventListener(TileLineContainer.tileLineStopResizeEventName, 
            this.boundTileLineContainerStopResize);
        window.addEventListener(DraggableTileView.draggingTileWasSelectedEventName, 
            this.boundOnDraggingTileWasSelected);
    }

    private tileLineCarouselContainerRemoveEventListeners(): void {
        window.removeEventListener(TileLineContainer.tileLineStartResizeEventName,
            this.boundOnTileLineContainerStartResize);
        window.removeEventListener(TileLineContainer.tileLineStopResizeEventName, 
            this.boundTileLineContainerStopResize);
        window.removeEventListener(DraggableTileView.draggingTileWasSelectedEventName, 
            this.boundOnDraggingTileWasSelected);
    }

    private onTileLineContainerStartResize(): void {
        this.tileLineCarouselContainer?.setOnPointerDownActivity(false);
    }

    private onTileLineContainerStopResize(): void {
        this.tileLineCarouselContainer?.setOnPointerDownActivity(true);
    }

    private onDraggingTileWasSelected(): void {
        this.tileLineCarouselContainer?.stopInertia();
    }

    //#endregion Контейнеры карусели линии с фигурами

    //#region Контейнеры элементов управления

    private createHintButton(): HintButton | undefined {
        if (!this.controlContainer) {
            return;
        }

        const radius = this.parameters.hintButtonRadiusToControlContainerHeightRatio
            * this.controlContainer.height;
        const centerX = this.parameters.hintButtonCenterXToControlContainerWidthRatio
            * this.controlContainer.width;
        const centerY = this.parameters.hintButtonCenterYToControlContainerHeightRatio
            * this.controlContainer.height;

        return new HintButton(
            this.parameters.hintButtonParameters,
            this.renderer,
            radius,    
            this.parameters.hintButtonIconSvgPath,
            new Point(centerX, centerY)
        );
    }

    private tilingViewAddEventListeners(): void {
        window.addEventListener(HintButton.hintButtonWasActivatedEventName,
            this.boundOnHintButtonWasActivated);
        window.addEventListener(HintButton.hintButtonWasDeactivatedEventName, 
            this.boundOnHintButtonWasDeactivated);
    }

    private tilingViewRemoveEventListeners(): void {
        window.removeEventListener(HintButton.hintButtonWasActivatedEventName,
            this.boundOnHintButtonWasActivated);
        window.removeEventListener(HintButton.hintButtonWasDeactivatedEventName, 
            this.boundOnHintButtonWasDeactivated);
    }

    private onHintButtonWasActivated(): void {
        this.tilingView?.setHintAlphaForStaticTiles();
    }

    private onHintButtonWasDeactivated(): void {
        this.tilingView?.setDefaultAlphaForStaticTiles();
    }

    //#endregion Контейнеры элементов управления

    //#region Тестовые данные

    private createImageAreaBackground(): Graphics | undefined {
        if (!this.imageAreaContainer) {
            return undefined;
        }

        const graphics = new Graphics()
            .rect(0, 0, this.imageAreaContainer.width, this.imageAreaContainer.height)
            .fill({ color: "green" });
        graphics.eventMode = 'none';
        graphics.interactiveChildren = false;
        graphics.cacheAsTexture(true);
        return graphics;
    }

    //#endregion Тестовые данные

    //#region Очистка и удаление

    private clearDraggingTileData(): void {
        draggingTileData.view = undefined;
        draggingTileData.viewport = undefined;
        draggingTileData.animatingViews.clear();
    }

    private destroyControlChildContainers(): void {
        if (this.hintButton) {
            this.tilingViewRemoveEventListeners();
            this.controlContainer?.removeChild(this.hintButton);  
            this.hintButton.destroy();
        }

        if (this.controlContainer) {
            this.removeChild(this.controlContainer);  
            this.controlContainer.destroy();
        }
    }

    private destroyTileLineCarouselContainers(): void {
        if (this.tileLineContainer) {
            this.tileLineCarouselContainer?.removeChild(this.tileLineContainer);  
            this.tileLineContainer.destroy();
        }

        if (this.tileLineCarouselContainer) {
            this.tileLineCarouselContainerRemoveEventListeners();
            this.tileLineCarouselContainer.getShouldPreventEvents = () => false;
            this.tileLineCarouselParentContainer
                ?.removeChild(this.tileLineCarouselContainer);  
            this.tileLineCarouselContainer.destroy();
        }

        if (this.tileLineCarouselParentContainer) {
            this.removeChild(this.tileLineCarouselParentContainer);  
            this.tileLineCarouselParentContainer.destroy();
        }
    }

    private destroyImageAreaContainers(): void {
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
            this.imageZoomAndPanContainer?.removeChild(this.imageContainer);  
            this.imageContainer.destroy();
        }

        if (this.imageZoomAndPanContainer) {
            this.imageAreaContainer?.removeChild(this.imageZoomAndPanContainer);  
            this.imageZoomAndPanContainer.destroy();
        }

        if (this.imageAreaBackground) {
            this.imageAreaContainer?.removeChild(this.imageAreaBackground);  
            this.imageAreaBackground.cacheAsTexture(false);
            this.imageAreaBackground.destroy();
        }

        if (this.imageAreaContainer) {
            this.imageAreaParentContainer?.removeChild(this.imageAreaContainer);  
            this.imageAreaContainer.destroy();
        }

        if (this.imageAreaParentContainer) {
            this.removeChild(this.imageAreaParentContainer);  
            this.imageAreaParentContainer.destroy();
        }
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        this.clearDraggingTileData();

        this.destroyControlChildContainers();
        this.destroyTileLineCarouselContainers();
        this.destroyImageAreaContainers();

        if (this.selectedTileContainer) {
            this.removeChild(this.selectedTileContainer);  
            this.selectedTileContainer.destroy();
        }

        super.destroy(options);
    }

    //#endregion Очистка и удаление
}