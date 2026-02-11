import { Point, Polygon } from "pixi.js";
import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";

/**
 * Класс геометрии квадрата.
 * Положением квадрата по умолчанию будем считать,
 * когда две стороны параллельны оси OX
 * и две стороны параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class SquareGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение  диагонали квадрата к его стороне.
     */
    public static readonly diagonalToSideRatio: number = Math.sqrt(2);

    public readonly geometryType: TileGeometryType = TileGeometryType.Square;
    /**
     * Диагональ квадрата.
     */
    public readonly diagonal: number;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 4, sideToBaseValueRatio);

        this.diagonal = this.side * SquareGeometry.diagonalToSideRatio;

        const sideHalf = this.side / 2.0;
        this.pivotPoint = new Point(sideHalf, sideHalf);        
        this.defaultBoundingRectangleSize = new Size(this.side, this.side);
        this.hitArea = new Polygon([
            new Point(0, 0),
            new Point(this.side, 0),
            new Point(this.side, this.side),
            new Point(0, this.side)
        ]);

        this.circumscribedCircleRadius = this.diagonal / 2.0;
        this.regularPolygonInitialRotationAngle = Math.PI / 4;
    }
}