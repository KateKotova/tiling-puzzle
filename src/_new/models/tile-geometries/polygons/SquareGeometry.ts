import { Point, Polygon } from "pixi.js";
import { RegularPolygonTileGeometry } from "./RegularPolygonTileGeometry.ts";
import { TileGeometryType } from "./TileGeometryType.ts";
import { Size } from "../../math/Size.ts";

/**
 * Класс геометрии квадрата.
 * Положением квадрата по умолчанию будем считать,
 * когда две стороны параллельны оси OX
 * и две стороны параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
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

        const halfSide = this.side / 2.0;
        this.pivotPoint = new Point(halfSide, halfSide);
        
        this.defaultBoundingRectangleSize = new Size(this.side, this.side);
        this.hitArea = new Polygon([
            new Point(-halfSide, -halfSide),
            new Point(halfSide, -halfSide),
            new Point(halfSide, halfSide),
            new Point(-halfSide, halfSide)
        ]);

        this.circumscribedCircleRadius = this.diagonal / 2.0;
        this.regularPolygonInitialRotationAngle = Math.PI / 4;
    }
}