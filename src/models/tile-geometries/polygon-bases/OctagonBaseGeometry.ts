import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";

/**
 * Класс геометрии для фигур на основе правильного восьмиугольника.
 * Положением восьмиугольника по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX
 * и две стороны, левая и правая, параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class OctagonBaseGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение диаметра вписанной окружности восьмиугольника к его стороне.
     */
    public static readonly inscribedCircleDiameterToSideRatio: number = 1 + Math.sqrt(2);
    /**
     * Отношение радиуса описанной окружности восьмиугольника к его стороне.
     */
    public readonly circumscribedCircleRadiusToSideRatio: number
        = 1 / Math.sqrt(2 - Math.sqrt(2));
    /**
     * Отношение радиуса вписанной окружности восьмиугольника к его стороне.
     */
    public readonly inscribedCircleRadiusToSideRatio: number = (1 + Math.sqrt(2)) / 2.0;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 8, sideToBaseValueRatio);
        this.setCircumscribedAndInscribedCircleRadiuses();
        this.regularPolygonInitialRotationAngle = 3 / 8.0 * Math.PI;
    }
}