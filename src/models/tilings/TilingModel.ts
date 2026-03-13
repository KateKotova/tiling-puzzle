import { Graphics, Matrix, Renderer, Texture } from "pixi.js";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TileLockType } from "../tile-locks/TileLockType.ts";
import { TilingContainerModel } from "../TilingContainerModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { TilingType } from "./TilingType.ts";
import { TileLockHeightToBaseValueRatios } from "../tile-locks/TileLockHeightToBaseValueRatios.ts";
import { TileModel } from "../tiles/TileModel.ts";
import { TilePosition } from "../tiles/TilePosition.ts";
import { TilingLayoutStrategyType } from "./TilingLayoutStrategyType.ts";
import { Algorithm } from "../../math/Algorithm.ts";
import { TileParameters } from "../tiles/TileParameters.ts";
import { TileGeometryType } from "../tile-geometries/TileGeometryType.ts";

/**
 * Класс модели замощения
 */
export abstract class TilingModel {
    public readonly tilingType: TilingType = TilingType.Unknown;
    public readonly lockType: TileLockType = TileLockType.None;

    protected readonly tileParameters: TileParameters;
    public isInitialized: boolean = false;
    public textureModel: TilingTextureModel;
    public tilingContainerModel?: TilingContainerModel;
    protected imageContainerModel: ImageContainerModel;
    private renderer: Renderer;

    //#region Texture tile info

    /**
     * Отступ по оси OX для контейнера замощения
     * в масштабе и координатах исходной текстуры
     */
    protected textureXTilingOffset: number = 0;
    /**
     * Отступ по оси OY для контейнера замощения
     * в масштабе и координатах исходной текстуры
     */
    protected textureYTilingOffset: number = 0;

    //#endregion Texture tile info

    /**
     * Карта, где по типу геометрии элемента мозаики
     * можно найти его максимальный предельный размер,
     * то есть предельную сторону прямоугольной границы фигуры при любом угле поворота.
     */
    public maxTileBoundingSizesByTileGeometryTypes: Map<TileGeometryType, number>
        = new Map<TileGeometryType, number>();

    /**
     * Карта, где по строковому представлению позиции
     * можно найти её индекс удалённости от края картинки
     */
    protected edgeDistanceIndicesByTilePositionStrings: Map<string, number>
        = new Map<string, number>();
    /**
     * Массив, индексы которого - индексы удалённости элементов замощения от края картинки.
     * По каждому индексу хранится массив позиций элементов замощения,
     * соответствующих данному индексу удалённости от края картинки.
     */
    public tilePositionsByEdgeDistanceIndices: TilePosition[][] = [];
    /**
     * Массив, где элементы замощения изначально перемешаны в зависимости
     * от выбранной стратегии сборки мозаики.
     * По мере сборки мозаики и иногда по мере возвращения элементов замещения обратно
     * этот массив может изменять. Когда мозаика собрана, массив оказывается пустым.
     */
    public shuffledTilePositions: TilePosition[] = [];

    constructor(
        tileParameters: TileParameters,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ) {
        this.tileParameters = tileParameters;
        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;
    }

    public getLockHeightToSideRatio(): number {
        return TileLockHeightToBaseValueRatios[this.lockType];
    }

    public initialize(): void {
        this.initializeTextureTileInfo();        
        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);
        this.initializeImageTileInfo();
        this.setTilePositionsByEdgeDistanceIndices();
        this.isInitialized = true;
    }

    protected abstract initializeTextureTileInfo(): void;

    protected abstract initializeImageTileInfo(): void;

    public abstract getTileModel(targetTilePosition: TilePosition): TileModel | undefined;

    /**
     * Заполнение массива, где по индексам удалённости элементов замощения от края картинки
     * хранятся массивы соответствующих позиций элементов замощения.
     */
    protected abstract setTilePositionsByEdgeDistanceIndices(): void;

    protected addTilePosition(
        tilePosition: TilePosition,
        edgeDistanceIndex: number,
        tilePositions: TilePosition[]
    ): void {
        tilePosition.edgeDistanceIndex = edgeDistanceIndex;
        this.edgeDistanceIndicesByTilePositionStrings.set(tilePosition.toString(), edgeDistanceIndex);
        tilePositions.push(tilePosition);
    }

    public getTileTexture(tileModel: TileModel): Texture {
        if (!this.tilingContainerModel) {
            throw new Error('tilingContainerModel is not initialized');
        }

        const sideToTextureSideRatio = this.imageContainerModel.sideToTextureSideRatio;

        const textureTileLocalPivotPointX = tileModel.geometry.pivotPoint.x
            / sideToTextureSideRatio;
        const textureTileLocalPivotPointY = tileModel.geometry.pivotPoint.y
            / sideToTextureSideRatio;

        const textureTileAbsolutePivotPointX = tileModel.targetPositionPoint.x
            / sideToTextureSideRatio
            + this.textureXTilingOffset;
        const textureTileAbsolutePivotPointY = tileModel.targetPositionPoint.y
            / sideToTextureSideRatio
             + this.textureYTilingOffset;
        
        const textureTileDefaultBoundingRectangleWidth
            = tileModel.geometry.defaultBoundingRectangleSize.width
            / sideToTextureSideRatio;
        const textureTileDefaultBoundingRectangleHeight
            = tileModel.geometry.defaultBoundingRectangleSize.height
            / sideToTextureSideRatio;

        const textureMatrix = new Matrix();
        textureMatrix.setTransform(
            0, 0,
            textureTileAbsolutePivotPointX, textureTileAbsolutePivotPointY,
            1, 1,
            -tileModel.targetRotationAngle,
            0, 0
        );
        const globalTile = new Graphics()
            .rect(
                -textureTileLocalPivotPointX,
                -textureTileLocalPivotPointY,
                textureTileDefaultBoundingRectangleWidth,
                textureTileDefaultBoundingRectangleHeight
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global",
                matrix: textureMatrix
            });

        const result = this.renderer.generateTexture({
            target: globalTile,
            resolution: 1,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });

        globalTile.destroy();
        return result;
    }

    /**
     * Установка массива позиций элементов замощения, согласно выбранной стратегии сборки мозаики,
     * для выдачи элементов мозаики пользователю
     * @param tilingLayoutStrategyType Стратегия укладки мозаики
     * @returns 
     */
    public setShuffledTilePositions(tilingLayoutStrategyType: TilingLayoutStrategyType) {
        this.shuffledTilePositions = [];
        switch (tilingLayoutStrategyType) {
            case TilingLayoutStrategyType.FromEdgesToCenter:
                for (
                    let edgeDistanceIndex = 0;
                    edgeDistanceIndex < this.tilePositionsByEdgeDistanceIndices.length;
                    edgeDistanceIndex++
                ) {
                    const shuffledTilePositions = Algorithm.getShuffledArray(
                        this.tilePositionsByEdgeDistanceIndices[edgeDistanceIndex]);
                    this.shuffledTilePositions.push(...shuffledTilePositions);
                }
                break;
            case TilingLayoutStrategyType.FromCenterToEdges:
                for (
                    let edgeDistanceIndex = this.tilePositionsByEdgeDistanceIndices.length - 1;
                    edgeDistanceIndex >= 0;
                    edgeDistanceIndex--
                ) {
                    const shuffledTilePositions = Algorithm.getShuffledArray(
                        this.tilePositionsByEdgeDistanceIndices[edgeDistanceIndex]);
                    this.shuffledTilePositions.push(...shuffledTilePositions);
                }
                break;
            case TilingLayoutStrategyType.Random:
                for (
                    let edgeDistanceIndex = 0;
                    edgeDistanceIndex < this.tilePositionsByEdgeDistanceIndices.length;
                    edgeDistanceIndex++
                ) {
                    this.shuffledTilePositions
                        .push(...this.tilePositionsByEdgeDistanceIndices[edgeDistanceIndex]);
                }
                this.shuffledTilePositions = Algorithm.getShuffledArray(this.shuffledTilePositions);
                break;
            default:
                break;
        }

        let shuffledIndex: number = 0;
        this.shuffledTilePositions.forEach((position: TilePosition) => {
            position.shuffledIndex = shuffledIndex++;
        });
    }
}