import { TilePosition } from "./TilePosition.ts";

export class RectangularGridTilePosition extends TilePosition {
    public rowIndex: number = 0;
    public columnIndex: number = 0;

    constructor(rowIndex: number, columnIndex: number) {
        super();
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
    }
}