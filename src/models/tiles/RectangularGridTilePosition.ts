import { TilePosition } from "./TilePosition.ts";

/**
 * Класс, определяющий позицию элемента замощения в замощении,
 * которое можно рассматривать как прямоугольную сетку,
 * где фигуры располагаются в строках и столбцах.
 */
export class RectangularGridTilePosition extends TilePosition {
    public readonly rowIndex: number;
    public readonly columnIndex: number;

    constructor(rowIndex: number = 0, columnIndex: number = 0) {
        super();
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
    }

    public clone(): TilePosition {
        return new RectangularGridTilePosition(this.rowIndex, this.columnIndex);
    }
}