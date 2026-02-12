import { Point } from "pixi.js";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";
import { AdditionalMath } from "../../../math/AdditionalMath.ts";
import { HexagonBaseGeometry } from "../polygon-bases/HexagonBaseGeometry.ts";

/**
 * Класс геометрии правильного шестиугольника.
 * Положением шестиугольника по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class HexagonGeometry extends HexagonBaseGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.Hexagon;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        this.pivotPoint = new Point(this.side, this.inscribedCircleRadius);
        this.regularPolygonInitialRotationAngle = Math.PI / 6.0;   
        this.defaultBoundingRectangleSize = new Size(
            this.side * 2,
            this.inscribedCircleRadius * 2
        );        
        this.hitArea = AdditionalMath.getRegularPolygon(
            this.pivotPoint,
            this.circumscribedCircleRadius,
            6,
            this.regularPolygonInitialRotationAngle
        );
    }
}