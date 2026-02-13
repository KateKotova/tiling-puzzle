import { TilingModel } from "./TilingModel.ts";
import { TileModel } from "../tiles/TileModel.ts";
import { TilePosition } from "../tiles/TilePosition.ts";
import { RectangularGridTilePosition } from "../tiles/RectangularGridTilePosition.ts";

/**
 * Класс модели замощения, представляющего собой прямоугольную сетку,
 * где фигуры размещаются в строках и столбцах
 */
export abstract class RectangularGridTilingModel extends TilingModel {

    //#region Texture tile info

    /**
     * Количество столбцов с элементами замощения
     */
    public tileColumnCount: number = 0;
    /**
     * Количество строк с элементами замощения
     */
    public tileRowCount: number = 0;

    //#endregion Texture tile info

    /**
     * Получение признака того, что в заданной строке и столбце должна быть фигура
     * в случае собранной мозаики
     * @param rowIndex Индекс строки
     * @param columnIndex Индекс столбца
     * @returns Признак корректности индексов строки и столбца
     */
    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.tileRowCount
            && columnIndex >= 0
            && columnIndex < this.tileColumnCount;
    }

    public getTileModel(targetTilePosition: TilePosition): TileModel | undefined {
        const targetPosition = targetTilePosition as RectangularGridTilePosition;
        if (!targetPosition) {
            throw new Error('tilePosition is not instance of RectangularGridTilePosition');
        }
        if (!this.getGridIndicesAreCorrect(targetPosition.rowIndex, targetPosition.columnIndex)) {
            return undefined;
        }        
        return this.getProtectedTileModel(targetPosition);
    }

    /**
     * Получение модели фигуры по её целевому положению в замощении
     * @param targetTilePosition Проверенная на корректность целевая позиция фигуры в замощении
     */
    protected abstract getProtectedTileModel(targetTilePosition: RectangularGridTilePosition)
        : TileModel;

    
    protected tilePositionEdgeDistanceIndices = new Map<string, number>();

    protected setTilePositionEdgeDistanceIndices(): void {

    }
}