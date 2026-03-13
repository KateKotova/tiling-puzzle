import { Point } from "pixi.js";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";
import { OctagonBaseGeometry } from "../polygon-bases/OctagonBaseGeometry.ts";

/**
 * Класс геометрии правильного восьмиугольника.
 * Положением восьмиугольника по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX
 * и две стороны, левая и правая, параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class OctagonGeometry extends OctagonBaseGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.Octagon;

    constructor(
        baseValue: number,
        sideToBaseValueRatio: number = 1,
        hitAreaSizeMultiplier: number = 1
    ) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        const inscribedCircleDiameter = this.inscribedCircleRadius * 2;
        this.pivotPoint = new Point(this.inscribedCircleRadius, this.inscribedCircleRadius);             
        this.defaultBoundingRectangleSize = new Size(inscribedCircleDiameter,
            inscribedCircleDiameter);
        this.hitArea = this.getHitAreaRegularPolygon(hitAreaSizeMultiplier);
        this.maxBoundingSize = this.circumscribedCircleRadius * 2;
    }
}