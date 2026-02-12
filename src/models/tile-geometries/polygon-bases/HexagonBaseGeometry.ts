import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";

/**
 * Класс геометрии для фигур на основе правильного шестиугольника.
 * Положением шестиугольника по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class HexagonBaseGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение диаметра вписанной окружности шестиугольника к его стороне.
     */
    public static readonly inscribedCircleDiameterToSideRatio: number = Math.sqrt(3);
    /**
     * Отношение радиуса описанной окружности шестиугольника к его стороне.
     */
    public readonly circumscribedCircleRadiusToSideRatio: number = 1;
    /**
     * Отношение радиуса вписанной окружности шестиугольника к его стороне.
     */
    public readonly inscribedCircleRadiusToSideRatio: number = Math.sqrt(3) / 2.0;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 6, sideToBaseValueRatio);
        this.setCircumscribedAndInscribedCircleRadiuses();
    }
}