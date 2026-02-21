import { Container, ContainerChild, ContainerOptions, Point } from "pixi.js";
import { TileLineParameters } from "./TileLineParameters.ts";
import { TilingView } from "../tilings/TilingView.ts";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";
import { TilePosition } from "../../models/tiles/TilePosition.ts";

/**
 * Класс контейнера линии, в которой содержатся элементы мозаики для сборки.
 * Может быть вертикальной (сверху вниз) или горизонтальной (слева направо).
 */
export class TileLineContainer extends Container {
    public readonly parameters: TileLineParameters;
    private readonly tilingView: TilingView;
    /**
     * Продольный размер.
     * Для направления слева направо это ширина.
     * Для направления сверху вниз это высота.
     */
    private readonly longitudinalSize: number;
    /**
     * Поперечный размер.
     * Для направления слева направо это высота.
     * Для направления сверху вниз это ширина.
     */
    private readonly transverseSize: number;
    /**
     * Масштаб элемента мозаики, чтобы он списывался в ленту
     */
    private readonly tileScale: number;
    /**
     * Максимальный предельный размер масштабированного элемента мозаики.
     */
    private readonly maxScaledTileBoundingSize: number;

    constructor(
        parameters: TileLineParameters,
        tilingView: TilingView,
        options?: ContainerOptions<ContainerChild>        
    ) {
        super(options);
        this.parameters = parameters;
        this.tilingView = tilingView;        

        const lineIsHorizontal = this.parameters.directionType
            == TileLineDirectionType.FromLeftToRight;            
        this.transverseSize = lineIsHorizontal
            ? options?.height ?? 0
            : options?.width ?? 0;

        this.maxScaledTileBoundingSize = this.transverseSize
            - 2 * this.parameters.transverseContentOffset;

        const tileCount = this.tilingView.model.shuffledTilePositions.length;
        this.longitudinalSize = 2 * this.parameters.longitudinalContentOffset
            + tileCount * this.maxScaledTileBoundingSize
            + (tileCount - 1) * this.parameters.betweenTilesOffset;

        if (lineIsHorizontal) {
           this.width = this.longitudinalSize; 
        } else {
            this.height = this.longitudinalSize;
        }
        
        this.tileScale = this.maxScaledTileBoundingSize
            / this.tilingView.model.maxTileBoundingSize;
    }

    // public createTiles() {

    // }

    public getTileCurrentPositionPoint(tilePosition: TilePosition): Point {
        const maxScaledTileBoundingSizeHalf = this.maxScaledTileBoundingSize / 2.0;
        const transverseCoordinate = this.parameters.transverseContentOffset
           + maxScaledTileBoundingSizeHalf;
        const longitudinalCoordinate = this.parameters.longitudinalContentOffset
            + tilePosition.shuffledIndex
            * (this.maxScaledTileBoundingSize + this.parameters.betweenTilesOffset)
            + maxScaledTileBoundingSizeHalf;

        return this.parameters.directionType == TileLineDirectionType.FromLeftToRight
            ? new Point(longitudinalCoordinate, transverseCoordinate)
            : new Point(transverseCoordinate, longitudinalCoordinate);
    }
}