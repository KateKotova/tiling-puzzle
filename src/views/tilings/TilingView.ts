import { Color, Container, Renderer, Ticker } from "pixi.js";
import { TilingModel } from "../../models/tilings/TilingModel.ts";
import { StaticTileView } from "../tile-decorators/StaticTileView.ts";
import { TileViewFactory } from "../tiles/TileViewFactory.ts";
import { TileViewCreationParameters } from "../tiles/TileViewCreationParameters.ts";
import { TilingParameters } from "./TilingParameters.ts";
import { DraggableTileView } from "../tile-decorators/DraggableTileView.ts";
import { TilesAlphaController } from "../controllers/TilesAlphaController.ts";
import { TileGeometryType } from "../../models/tile-geometries/TileGeometryType.ts";
import { draggingTileData } from "../tile-decorators/DraggingTileData.ts";
import { TileView } from "../tiles/TileView.ts";

/**
 * Класс представления замощения
 */
export class TilingView {
    public readonly parameters: TilingParameters;
    public model: TilingModel;
    public tilingContainer: Container;
    public staticTilesContainer: Container;
    public draggableTilesContainer: Container;
    /**
     * Цвет заливки статических элементов замощения по умолчанию
     */
    public defaultStaticTileFillColor: Color;
    /**
     * Цвет заливки статических элементов, который устанавливается
     * для фигур того же типа геометрии, что и выбранный перетаскиваемый элемент замощения
     */
    private targetStaticTileFillColor: Color;
    /**
     * Карта, где по строковому представлению позиции
     * можно найти статический элемент замощения, представляющий собой
     * ячейку для размещения перетаскиваемой фигуры
     */
    public staticTileViewsByTilePositionStrings: Map<string, StaticTileView>
        = new Map<string, StaticTileView>();
    /**
     * Карта, где по строковому представлению позиции
     * можно найти перетаскиваемый элемент замощения
     */
    public draggableTileViewsByTilePositionStrings: Map<string, DraggableTileView>
        = new Map<string, DraggableTileView>();

    public staticTilesAlphaController?: TilesAlphaController;

    /**
     * Потенциальная перетаскиваемая фигура, выбранная для подсказки
     */
    private potentialDraggableTileView?: DraggableTileView;
    /**
     * Целевая ячейка для потенциальной перетаскиваемой фигуры
     */
    private potentialTargetStaticTileView?: StaticTileView;
    /**
     * Перемещаемая фигура, которая в данный момент занимает целевую ячейку
     * для потенциальной перетаскиваемой фигуры
     */
    private potentialTargetDraggableTileView?: DraggableTileView;

    /**
     * Таймер, который обеспечивает небольшую паузу на время тапа по перетаскиваемой фигуре,
     * чтобы не было моргания при тапе на фигуре,
     * потому что тап предполагает только поворот, а не длительное перетаскивание
     */
    private draggingTileTapTimer?: number;
    /**
     * Таймер, который обеспечивает показ картинки пользователю перед началом сборки
     */
    private imageInitialShowTimer?: number;
    /**
     * Таймер, который обеспечивает небольшую паузу между показом фильтра подсказки
     * потенциальной перетаскиваемой фигуры и показом фильтра подсказки
     * целевой ячейки и фигуры, которая, возможно, находится на этой ячейке в данный момент.
     */
    private showPotentialTargetHintGlowFilterTimer?: number;

    private boundOnDraggingTileWasSelected: (event: CustomEvent<DraggableTileView>) => void
        = this.onDraggingTileWasSelected.bind(this);
    private boundOnDraggingTileIsDeselected: (event: CustomEvent<DraggableTileView>) => void
        = this.onDraggingTileIsDeselected.bind(this);
    private boundOnShouldRemoveStaticTileTargetGlowFilters:
        (event: CustomEvent<Set<StaticTileView>>) => void
        = this.onShouldRemoveStaticTileTargetGlowFilters.bind(this);

    constructor(
        parameters: TilingParameters,
        model: TilingModel,
        defaultStaticTileFillColor: Color,
        targetStaticTileFillColor: Color
    ) {
        if (!model.isInitialized) {
            throw new Error('The tiling model is not initialized');
        }

        this.parameters = parameters;
        this.model = model;
        this.defaultStaticTileFillColor = defaultStaticTileFillColor;
        this.targetStaticTileFillColor = targetStaticTileFillColor;
        this.tilingContainer = this.createTilingContainer();

        this.staticTilesContainer = new Container();
        this.staticTilesContainer.sortableChildren = true;
        this.tilingContainer.addChild(this.staticTilesContainer);

        this.draggableTilesContainer = new Container();
        this.draggableTilesContainer.sortableChildren = true;
        this.tilingContainer.addChild(this.draggableTilesContainer);

        window.addEventListener(DraggableTileView.draggingTileWasSelectedEventName,
            this.boundOnDraggingTileWasSelected as EventListener);
        window.addEventListener(
            DraggableTileView.shouldRemoveStaticTileTargetGlowFiltersEventName,
            this.boundOnShouldRemoveStaticTileTargetGlowFilters as EventListener);     
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

    public createStaticTileViews(renderer: Renderer, ticker: Ticker): void {
        const tileViewFactory = new TileViewFactory();

        for (
            let edgeDistanceIndex = 0;
            edgeDistanceIndex < this.model.tilePositionsByEdgeDistanceIndices.length;
            edgeDistanceIndex++
        ) {
            const tilePositions = this.model
                .tilePositionsByEdgeDistanceIndices[edgeDistanceIndex];
            for (
                let tilePositionIndex = 0;
                tilePositionIndex < tilePositions.length;
                tilePositionIndex++
            ) {
                const tilePosition = tilePositions[tilePositionIndex];
                
                const tileModel = this.model.getTileModel(tilePosition);
                if (!tileModel) {
                    continue;
                }
                tileModel.currentRotationAngle = tileModel.targetRotationAngle;
                tileModel.currentTargetRotationAngle = tileModel.targetRotationAngle;
                tileModel.currentPositionPoint.copyFrom(tileModel.targetPositionPoint);

                const tileViewCreationParameters: TileViewCreationParameters = {
                    model: tileModel,
                    texture: undefined,
                    renderer,
                    replacingTextureFillColor: this.defaultStaticTileFillColor,
                    shouldCacheTileAsTexture: true
                };
                const tileView = tileViewFactory.getView(
                    this.parameters.tileParameters,
                    tileViewCreationParameters
                );
                // Изначально ячейки прозрачные,
                // чтобы пользователь увидел картинку на короткое время
                tileView.tile.alpha = this.parameters.staticTileParameters.transparentAlpha;

                this.staticTilesContainer.addChild(tileView.tile);

                const decoratedTileView = new StaticTileView(
                    this.parameters.staticTileParameters,
                    tileView
                );
                this.staticTileViewsByTilePositionStrings.set(
                    tilePosition.toString(),
                    decoratedTileView
                );
            }
        }

        this.setStaticTileZIndices();

        this.staticTilesAlphaController = new TilesAlphaController(
            this.parameters.animationParameters,
            [...this.staticTileViewsByTilePositionStrings.values()],
            ticker
        );

        this.hideInitialShownImage();
    }

    private hideInitialShownImage(): void {
        if (this.imageInitialShowTimer !== undefined) {
            clearTimeout(this.imageInitialShowTimer);
        }

        this.imageInitialShowTimer = setTimeout(() => {
                this.imageInitialShowTimer = undefined;
                if (this.getStaticTilesAlpha()
                    === this.parameters.staticTileParameters.transparentAlpha) {
                    this.staticTilesAlphaController?.restart(
                        this.parameters.staticTileParameters.transparentAlpha,
                        this.parameters.staticTileParameters.defaultAlpha
                    );
                }
            },
            this.parameters.imageInitialShowTime
        );
    }

    private getStaticTilesAlpha(): number | undefined {
        return this.staticTileViewsByTilePositionStrings.size
            ? this.staticTileViewsByTilePositionStrings.values().next().value?.tile.alpha
            : undefined;
    }

    public setHintAlphaForStaticTiles(): void {
        this.staticTilesAlphaController?.restart(
            this.getStaticTilesAlpha() ?? this.parameters.staticTileParameters.defaultAlpha,
            this.parameters.staticTileParameters.hintAlpha
        );
    }

    public setDefaultAlphaForStaticTiles(): void {
        this.staticTilesAlphaController?.restart(
            this.getStaticTilesAlpha() ?? this.parameters.staticTileParameters.hintAlpha,
            this.parameters.staticTileParameters.defaultAlpha
        );
    }

    private setStaticTileFillColor(
        geometryType: TileGeometryType,
        fillColor: Color
    ): void {
        const tileViews = [...this.staticTileViewsByTilePositionStrings.values()]
            .filter(tileView => tileView.view.model.geometry.geometryType === geometryType);

        tileViews.forEach(tileView => {
            tileView.view.replacingTextureFillColor = fillColor;
            const newContent = tileView.createContent(true);
            tileView.view.replaceContent(newContent);
        });
    }

    private setStaticTileZIndices(): void {
        const tileViews = [...this.staticTileViewsByTilePositionStrings.values()];
        return this.setTileZIndices(tileViews);
    }

    public setDraggableTileZIndices(): void {
        const tileViews = [...this.draggableTileViewsByTilePositionStrings.values()];
        return this.setTileZIndices(tileViews);
    }

    private setTileZIndices(tileViews: TileView[]): void {
        const setTileZIndex: (tileView: TileView) => void
            = this.model.tileZIndicesByTileGeometryTypes.size < 2
            ? tileView => tileView.tile.zIndex = 0
            : tileView => {
                const geometryType = tileView.model.geometry.geometryType;
                const zIndex = this.model.tileZIndicesByTileGeometryTypes.get(geometryType);
                tileView.tile.zIndex = zIndex === undefined ? 0 : zIndex;
            };
        tileViews.forEach(setTileZIndex);
    }

    private onDraggingTileWasSelected(event: CustomEvent<DraggableTileView>): void {
        if (this.draggingTileTapTimer !== undefined) {
            clearTimeout(this.draggingTileTapTimer);
        }

        // Делаем небольшую паузу на тап, чтобы не было моргания при тапе на фигуре,
        // потому что тап предполагает только поворот, а не длительное перетаскивание        
        this.draggingTileTapTimer = setTimeout(() => {
                this.draggingTileTapTimer = undefined;
                if (draggingTileData.view) {
                    const geometryType = event.detail.model.geometry.geometryType;
                    this.setStaticTileFillColor(geometryType, this.targetStaticTileFillColor);

                    window.addEventListener(DraggableTileView.draggingTileWasDeselectedEventName,
                        this.boundOnDraggingTileIsDeselected as EventListener);
                }
            }, 
            this.parameters.tapParameters.maxDuration
        );
    }

    private onDraggingTileIsDeselected(event: CustomEvent<DraggableTileView>): void {
        window.removeEventListener(DraggableTileView.draggingTileWasDeselectedEventName,
            this.boundOnDraggingTileIsDeselected as EventListener);

        const geometryType = event.detail.model.geometry.geometryType;
        this.setStaticTileFillColor(geometryType, this.defaultStaticTileFillColor);
    }

    /**
     * Удаление подсветки целевых элементов со всех статических ячеек, кроме тех,
     * что указаны в параметрах как исключения
     * @param event Событие, содержащее множество статических ячеек,
     * с которых подсветка убираться не будет
     */
    public onShouldRemoveStaticTileTargetGlowFilters(
        event: CustomEvent<Set<StaticTileView>>
    ): void {
        const excludingStaticTileViews = event.detail;
        let tileViews = [...this.staticTileViewsByTilePositionStrings.values()];
        if (excludingStaticTileViews.size) {
            tileViews = tileViews.filter(tileView => !excludingStaticTileViews.has(tileView));
        }
        tileViews.forEach(tileView => tileView.removeTargetGlowFilter());
    }

    /**
     * Установка потенциальной перетаскиваемой фигуры и её целевой позиции
     * @param draggableTileView Потенциальная перетаскиваемая фигура
     */
    private setPotentialTileViews(draggableTileView: DraggableTileView): void {
        this.potentialDraggableTileView = draggableTileView;

        const tilePositionString = draggableTileView.model.targetTilePosition.toString();
        this.potentialTargetStaticTileView = this.staticTileViewsByTilePositionStrings
            .get(tilePositionString);
        this.potentialTargetDraggableTileView
            = [...this.draggableTileViewsByTilePositionStrings.values()]
            .find(currentDraggableTileView =>
                currentDraggableTileView.getSourceTilePosition()?.toString() === tilePositionString);
    }

    private clearPotentialTileViews(): void {
        this.potentialDraggableTileView = undefined;
        this.potentialTargetStaticTileView = undefined;
        this.potentialTargetDraggableTileView = undefined;
    }

    /**
     * Подсветка выбранного для подсказки элемента мозаики и его целевой ячейки.
     * Если целевая ячейка занята, то также подсвечивается фигура, которая занимает эту ячейку.
     * @param draggableTileView Перетаскиваемый элемент мозаики, выбранный для подсказки
     */
    public addHintGlowFilterToPotentialTileViews(draggableTileView: DraggableTileView): void {
        this.setPotentialTileViews(draggableTileView);

        if (this.potentialDraggableTileView) {
            this.potentialDraggableTileView.addHintGlowFilter();
        }

        const shouldShowPotentialTargetDraggableTileViewHintGlowFilter
            = this.potentialTargetDraggableTileView
            && this.potentialTargetDraggableTileView !== this.potentialDraggableTileView;

        if (
            this.potentialTargetStaticTileView
            || shouldShowPotentialTargetDraggableTileViewHintGlowFilter
        ) {
            if (this.showPotentialTargetHintGlowFilterTimer !== undefined) {
                clearTimeout(this.showPotentialTargetHintGlowFilterTimer);
            }

            this.showPotentialTargetHintGlowFilterTimer = setTimeout(() => {
                    this.showPotentialTargetHintGlowFilterTimer = undefined;
                    if (this.potentialTargetStaticTileView) {
                        this.potentialTargetStaticTileView.addHintGlowFilter();
                    }
                    if (shouldShowPotentialTargetDraggableTileViewHintGlowFilter) {
                        this.potentialTargetDraggableTileView?.addHintGlowFilter();
                    }
                },
                this.parameters.potentialTargetHintGlowFilterShowDelay
            );
        }
    }

    /**
     * Удаление подсветки-подсказки со всех элементов, которые были затронуты:
     * с элемента мозаики для перемещения,
     * с целевой ячейки и с фигуры, которая занимает целевую ячейку, если она есть.
     */
    public removeHintGlowFilterFromPotentialTileViews(): void {
        if (this.potentialDraggableTileView) {
            this.potentialDraggableTileView.removeHintGlowFilter();
        }
        if (this.potentialTargetStaticTileView) {
            this.potentialTargetStaticTileView.removeHintGlowFilter();
        }
        if (
            this.potentialTargetDraggableTileView
            && this.potentialTargetDraggableTileView !== this.potentialDraggableTileView
        ) {
            this.potentialTargetDraggableTileView.removeHintGlowFilter();
        }
        this.clearPotentialTileViews();
    }

    /**
     * Получение первого элемента мозаики, размещённого на игровом поле,
     * который точно размещён уже на игровом поле, а не на полосе прокрутки,
     * и который размещён при этом не правильно.
     * Этот метод необходим для получения подсказки: сначала для подсказки
     * пытаемся выбрать первый видимый элемент мозаики.
     * Если таких нет, то выбирается фигура, уже размещённая на игровом поле,
     * при этом размещённая неправильно.
     * @returns Первая неправильно размещённая фигура на игровом поле.
     */
    public getFirstTileInTilingContainerLocatedIncorrectly(): TileView | undefined {
        return [...this.draggableTileViewsByTilePositionStrings.values()].find(tileView =>
            tileView.dragSource && !tileView.isLocatedCorrectly);
    }

    public destroy(): void {
        if (this.draggingTileTapTimer !== undefined) {
            clearTimeout(this.draggingTileTapTimer);
            this.draggingTileTapTimer = undefined;
        }

        if (this.imageInitialShowTimer !== undefined) {
            clearTimeout(this.imageInitialShowTimer);
            this.imageInitialShowTimer = undefined;
        }

        if (this.showPotentialTargetHintGlowFilterTimer !== undefined) {
            clearTimeout(this.showPotentialTargetHintGlowFilterTimer);
            this.showPotentialTargetHintGlowFilterTimer = undefined;
        }

        window.removeEventListener(DraggableTileView.draggingTileWasSelectedEventName,
            this.boundOnDraggingTileWasSelected as EventListener);
        window.removeEventListener(DraggableTileView.draggingTileWasDeselectedEventName,
            this.boundOnDraggingTileIsDeselected as EventListener);
        window.removeEventListener(
            DraggableTileView.shouldRemoveStaticTileTargetGlowFiltersEventName,
            this.boundOnShouldRemoveStaticTileTargetGlowFilters as EventListener);

        this.clearPotentialTileViews();

        this.staticTilesAlphaController?.destroy();

        draggingTileData.view = undefined;
        draggingTileData.animatingViews.clear();

        for (const tileView of this.draggableTileViewsByTilePositionStrings.values()) {
            tileView.view.tile.parent?.removeChild(tileView.view.tile);
            tileView.destroy();
        }
        this.draggableTileViewsByTilePositionStrings.clear();

        for (const tileView of this.staticTileViewsByTilePositionStrings.values()) {
            tileView.view.tile.parent?.removeChild(tileView.view.tile);
            tileView.destroy();
        }
        this.staticTileViewsByTilePositionStrings.clear();

        this.staticTilesContainer.destroy();
        this.draggableTilesContainer.destroy();
        this.tilingContainer.destroy();
    }
}