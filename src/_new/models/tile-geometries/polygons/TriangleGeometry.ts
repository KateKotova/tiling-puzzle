import { Point, Polygon } from "pixi.js";
import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";

/**
 * Класс геометрии правильного треугольника.
 * Положением треугольника по умолчанию будем считать,
 * когда нижняя сторона параллельна оси OX,
 * а вверху находится первая вершина треугольника.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class TriangleGeometry extends RegularPolygonTileGeometry {
     /**
     * Отношение высоты треугольника к его стороне.
     */
    public static readonly heightToSideRatio: number = Math.sqrt(3) / 2.0;

    public readonly geometryType: TileGeometryType = TileGeometryType.Triangle;
    /**
     * Высота треугольника.
     */
    public readonly height: number;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 3, sideToBaseValueRatio);

        this.height = this.side * TriangleGeometry.heightToSideRatio;

        const sideHalf = this.side / 2.0;
        const heightThird = this.height / 3.0;
        const heightTwoThirds = 2 * heightThird;
        this.pivotPoint = new Point(sideHalf, heightTwoThirds);        
        this.defaultBoundingRectangleSize = new Size(this.side, this.height);
        this.hitArea = new Polygon([
            new Point(0, -heightTwoThirds),
            new Point(sideHalf, heightThird),
            new Point(-sideHalf, heightThird)
        ]);

        this.circumscribedCircleRadius = heightTwoThirds;
        this.regularPolygonInitialRotationAngle = 0;
    }
}