import { Point } from "pixi.js";
import { RegularPolygonTileGeometry } from "../RegularPolygonTileGeometry.ts";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";
import { AdditionalMath } from "../../../math/AdditionalMath.ts";

/**
 * Класс геометрии правильного шестиугольника.
 * Положением шестиугольника по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class HexagonGeometry extends RegularPolygonTileGeometry {
    /**
     * Отношение диаметра вписанной окружности шестиугольника к его стороне.
     */
    public static readonly inscribedCircleDiameterToSideRatio: number = Math.sqrt(3);

    public readonly geometryType: TileGeometryType = TileGeometryType.Hexagon;
    /**
     * Диаметр вписанной окружности шестиугольника.
     */
    public readonly inscribedCircleDiameter: number;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 6, sideToBaseValueRatio);

        this.inscribedCircleDiameter = this.side
            * HexagonGeometry.inscribedCircleDiameterToSideRatio;

        const heightHalf = this.inscribedCircleDiameter / 2.0;
        this.pivotPoint = new Point(this.side, heightHalf);        
        this.defaultBoundingRectangleSize = new Size(this.side * 2, this.inscribedCircleDiameter);

        this.circumscribedCircleRadius = this.side;
        this.regularPolygonInitialRotationAngle = Math.PI / 6.0;
        this.hitArea = AdditionalMath.getRegularPolygon(
            this.pivotPoint,
            this.circumscribedCircleRadius,
            6,
            this.regularPolygonInitialRotationAngle
        );
    }
}