import { Point } from "pixi.js";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";
import { SquareBaseGeometry } from "../polygon-bases/SquareBaseGeometry.ts";

/**
 * Класс геометрии квадрата.
 * Положением квадрата по умолчанию будем считать,
 * когда две стороны параллельны оси OX
 * и две стороны параллельны оси OY.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class SquareGeometry extends SquareBaseGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.Square;

    constructor(
        baseValue: number,
        sideToBaseValueRatio: number = 1,
        hitAreaSizeMultiplier: number = 1
    ) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        const sideHalf = this.side / 2.0;
        this.pivotPoint = new Point(sideHalf, sideHalf);              
        this.defaultBoundingRectangleSize = new Size(this.side, this.side);
        this.hitArea = this.getHitAreaRegularPolygon(hitAreaSizeMultiplier);
        this.maxBoundingSize = this.circumscribedCircleRadius * 2;
    }
}