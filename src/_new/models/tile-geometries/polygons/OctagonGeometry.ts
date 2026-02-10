import { Point } from "pixi.js";
import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry";
import { TileGeometryType } from "../TileGeometryType";
import { Size } from "../../../math/Size";
import { AdditionalMath } from "../../../math/AdditionalMath";

/**
 * Класс геометрии правильного восьмиугольника.
 * Положением восьмиугольника по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX
 * и две стороны, левая и правая, параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class OctagonGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение диаметра вписанной окружности восьмиугольника к его стороне.
     */
    public static readonly inscribedCircleDiameterToSideRatio: number = 1 + Math.sqrt(2);
    /**
     * Отношение радиуса описанной окружности восьмиугольника к его стороне.
     */
    public static readonly circumscribedCircleRadiusToSideRatio: number
        = Math.sqrt(1 - Math.sqrt(2) / 2.0);

    public readonly geometryType: TileGeometryType = TileGeometryType.Octagon;
    /**
     * Диаметр вписанной окружности восьмиугольника.
     */
    public readonly inscribedCircleDiameter: number;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 8, sideToBaseValueRatio);

        this.inscribedCircleDiameter = this.side
            * OctagonGeometry.inscribedCircleDiameterToSideRatio;

        const inscribedCircleRadius = this.inscribedCircleDiameter / 2.0;
        this.pivotPoint = new Point(inscribedCircleRadius, inscribedCircleRadius);        
        this.defaultBoundingRectangleSize = new Size(this.inscribedCircleDiameter,
            this.inscribedCircleDiameter);

        this.circumscribedCircleRadius = this.side
            * OctagonGeometry.circumscribedCircleRadiusToSideRatio;
        this.regularPolygonInitialRotationAngle = 3 / 8.0 * Math.PI;
        this.hitArea = AdditionalMath.getRegularPolygon(
            new Point(0, 0),
            this.circumscribedCircleRadius,
            8,
            this.regularPolygonInitialRotationAngle
        );
    }
}