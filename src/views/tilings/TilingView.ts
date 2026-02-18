import { Color, Container, Renderer, Ticker } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { ViewSettings } from "../ViewSettings.ts";
import { DraggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { ViewportContainer } from "../ViewportContainer.ts";

/**
 * Класс представления замощения
 */
export abstract class TilingView {
    protected readonly viewSettings: ViewSettings;
    public model: TilingModel;
    public tilingContainer: Container;
    public staticTilesContainer: Container;
    public draggableTilesContainer: Container;
    protected staticTileFillColor: Color = new Color(0x00AA00);
    protected selectedTileContainer: Container;
    protected draggingTileData: DraggingTileData;

    constructor(
        viewSettings: ViewSettings,
        viewport: ViewportContainer,
        model: TilingModel
    ) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }

        this.viewSettings = viewSettings;
        this.draggingTileData = {
            view: null,
            viewport: viewport
        };
        this.model = model;
        this.tilingContainer = this.createTilingContainer();

        this.staticTilesContainer = new Container();
        this.tilingContainer.addChild(this.staticTilesContainer);

        this.draggableTilesContainer = new Container();
        this.tilingContainer.addChild(this.draggableTilesContainer);

        this.selectedTileContainer = new Container();
        this.tilingContainer.addChild(this.selectedTileContainer);
    }

    private createTilingContainer(): Container {
        const rectangle = this.model.tilingContainerModel!.boundingRectangle;
        return new Container({
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        });
    }

    /**
     * Создание тестового замощения для примера
     * @param renderer Инструменты отображения
     * @param ticker Инструменты контроля времени
     */
    public abstract setExampleTiling(renderer: Renderer, ticker: Ticker): void;
}