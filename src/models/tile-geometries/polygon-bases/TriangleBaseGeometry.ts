import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";

/**
 * Класс геометрии для фигур на основе правильного треугольника.
 * Положением треугольника по умолчанию будем считать,
 * когда нижняя сторона параллельна оси OX,
 * а вверху находится первая вершина треугольника.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class TriangleBaseGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение высоты треугольника к его стороне.
     */
    public static readonly heightToSideRatio: number = Math.sqrt(3) / 2.0;
    /**
     * Отношение радиуса описанной окружности треугольника к его стороне.
     */
    public readonly circumscribedCircleRadiusToSideRatio: number = Math.sqrt(3) / 3.0;
    /**
     * Отношение радиуса вписанной окружности треугольника к его стороне.
     */
    public readonly inscribedCircleRadiusToSideRatio: number = Math.sqrt(3) / 6.0;

    /**
     * Высота треугольника.
     */
    public readonly height: number;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 3, sideToBaseValueRatio);
        this.setCircumscribedAndInscribedCircleRadiuses();
        this.height = this.circumscribedCircleRadius + this.inscribedCircleRadius;
    }
}