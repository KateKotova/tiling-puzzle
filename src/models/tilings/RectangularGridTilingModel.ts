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

    public static getMaxTilePositionEdgeDistanceIndex(
        tileRowCount: number,
        tileColumnCount: number
    ): number {
        return Math.ceil(Math.min(tileRowCount, tileColumnCount) / 2.0) - 1;
    }

    protected addTilePositionByIndices(
        rowIndex: number,
        columnIndex: number,
        edgeDistanceIndex: number,
        tilePositions: TilePosition[]
    ): void {
        const tilePosition = new RectangularGridTilePosition(rowIndex, columnIndex);
        this.addTilePosition(tilePosition, edgeDistanceIndex, tilePositions);
    }

    protected setTilePositionsByEdgeDistanceIndices(): void {
        const maxEdgeDistanceIndex = RectangularGridTilingModel.getMaxTilePositionEdgeDistanceIndex(
            this.tileRowCount, this.tileColumnCount);
        for (
            let edgeDistanceIndex = 0;
            edgeDistanceIndex <= maxEdgeDistanceIndex;
            edgeDistanceIndex++
        ) {
            const tilePositions: TilePosition[] = []; 

            const topRowIndex = edgeDistanceIndex;
            const bottomRowIndex = this.tileRowCount - 1 - edgeDistanceIndex;

            const maxColumnIndex = this.tileColumnCount - 1 - edgeDistanceIndex;
            for (let columnIndex = edgeDistanceIndex; columnIndex <= maxColumnIndex; columnIndex++) {
                this.addTilePositionByIndices(
                    topRowIndex,
                    columnIndex,
                    edgeDistanceIndex,
                    tilePositions
                );
                this.addTilePositionByIndices(
                    bottomRowIndex,
                    columnIndex,
                    edgeDistanceIndex,
                    tilePositions
                );
            }

            const leftColumnIndex = edgeDistanceIndex;
            const rightColumnIndex = this.tileColumnCount - 1 - edgeDistanceIndex;

            const maxRowIndex = this.tileRowCount - 2 - edgeDistanceIndex;
            for (let rowIndex = edgeDistanceIndex + 1; rowIndex <= maxRowIndex; rowIndex++) {
                this.addTilePositionByIndices(
                    rowIndex,
                    leftColumnIndex,
                    edgeDistanceIndex,
                    tilePositions
                );
                this.addTilePositionByIndices(
                    rowIndex,
                    rightColumnIndex,
                    edgeDistanceIndex,
                    tilePositions
                );
            }

            this.tilePositionsByEdgeDistanceIndices.push(tilePositions);
        }
    }
}