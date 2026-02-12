import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";

/**
 * Класс геометрии для фигур на основе квадрата.
 * Положением квадрата по умолчанию будем считать,
 * когда две стороны параллельны оси OX
 * и две стороны параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class SquareBaseGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение радиуса описанной окружности квадрата к его стороне.
     */
    public readonly circumscribedCircleRadiusToSideRatio: number = Math.sqrt(2) / 2.0;
    /**
     * Отношение радиуса вписанной окружности квадрата к его стороне.
     */
    public readonly inscribedCircleRadiusToSideRatio: number = 0.5;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 4, sideToBaseValueRatio);
        this.setCircumscribedAndInscribedCircleRadiuses();
    }
}