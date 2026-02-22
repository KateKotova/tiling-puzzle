import { TilePosition } from "../tiles/TilePosition";
import { RectangularGridTilingModel } from "./RectangularGridTilingModel";

/**
 * Класс базовой модели замощения, представляющего собой прямоугольную сетку,
 * где в строках и столбцах размещаются фигуры на базе правильных восьмиугольников и квадратов.
 * Восьмиугольники расположены так, что их верхние и нижние стороны горизонтальны,
 * а левые и правые - вертикальны.
 * Квадраты находится между восьмиугольниками, они повёрнуты на 90 градусов
 * относительно своего обычного положения, то есть первая вершина смотрит вверх.
 * Будем считать, что в чётных строках расположены восьмиугольники,
 * а в нечётных - квадраты.
 * Края будут все заполнены состыкованными восьмиугольниками,
 * поэтому строк, содержащих квадраты, будет на одну строку меньше,
 * чем строк, содержащих восьмиугольники,
 * а также столбцов, содержащих квадраты, будет на один столбец меньше,
 * чем столбцов, содержащих восьмиугольники.
 */
export abstract class OctagonAndSquareTilingBaseModel extends RectangularGridTilingModel {
    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.tileRowCount
            && columnIndex >= 0
            && columnIndex < this.tileColumnCount - (rowIndex % 2);
    }

    protected setTilePositionsByEdgeDistanceIndices(): void {
        const octagonRowCount = Math.ceil(this.tileRowCount / 2.0);
        const octagonColumnCount = this.tileColumnCount;
        const maxOctagonEdgeDistanceIndex = RectangularGridTilingModel
            .getMaxTilePositionEdgeDistanceIndex(
            octagonRowCount, octagonColumnCount);

        const squareRowCount = octagonRowCount - 1;
        const squareColumnCount = octagonColumnCount - 1;
        const maxSquareEdgeDistanceIndex = RectangularGridTilingModel
            .getMaxTilePositionEdgeDistanceIndex(
            squareRowCount, squareColumnCount);

        const maxEdgeDistanceIndex = maxOctagonEdgeDistanceIndex + maxSquareEdgeDistanceIndex + 1;
        for (
            let edgeDistanceIndex = 0;
            edgeDistanceIndex <= maxEdgeDistanceIndex;
            edgeDistanceIndex++
        ) {
            let topRowIndex: number;
            let bottomRowIndex: number;
            let leftColumnIndex: number;
            let rightColumnIndex: number;

            const tilePositions: TilePosition[] = [];
            const isOctagonEdgeDistanceIndex = edgeDistanceIndex % 2 == 0;
            if (isOctagonEdgeDistanceIndex) {
                const octagonEdgeDistanceIndex = edgeDistanceIndex / 2;
                topRowIndex = 2 * octagonEdgeDistanceIndex;
                bottomRowIndex = this.tileRowCount - 1 - topRowIndex;
                leftColumnIndex = octagonEdgeDistanceIndex;
                rightColumnIndex = this.tileColumnCount - 1 - leftColumnIndex;
            } else {
                const squareEdgeDistanceIndex = Math.floor(edgeDistanceIndex / 2);
                topRowIndex = 2 * squareEdgeDistanceIndex + 1;
                bottomRowIndex = this.tileRowCount - 1 - topRowIndex;
                leftColumnIndex = squareEdgeDistanceIndex;
                rightColumnIndex = this.tileColumnCount - 2 - leftColumnIndex;
            }

            for (let columnIndex = leftColumnIndex; columnIndex <= rightColumnIndex; columnIndex++) {
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

            const startRowIndex = topRowIndex + 2;
            const endRowIndex = bottomRowIndex - 2;
            for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex += 2) {
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