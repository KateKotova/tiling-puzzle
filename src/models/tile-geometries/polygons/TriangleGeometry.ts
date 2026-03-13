import { Point } from "pixi.js";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";
import { TriangleBaseGeometry } from "../polygon-bases/TriangleBaseGeometry.ts";

/**
 * Класс геометрии правильного треугольника.
 * Положением треугольника по умолчанию будем считать,
 * когда нижняя сторона параллельна оси OX,
 * а вверху находится первая вершина треугольника.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class TriangleGeometry extends TriangleBaseGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.Triangle;

    constructor(
        baseValue: number,
        sideToBaseValueRatio: number = 1,
        hitAreaSizeMultiplier: number = 1
    ) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        const sideHalf = this.side / 2.0;
        this.pivotPoint = new Point(sideHalf, this.circumscribedCircleRadius);                
        this.defaultBoundingRectangleSize = new Size(this.side, this.height);
        this.hitArea = this.getHitAreaRegularPolygon(hitAreaSizeMultiplier);
        this.maxBoundingSize = this.circumscribedCircleRadius * 2;
    }
}