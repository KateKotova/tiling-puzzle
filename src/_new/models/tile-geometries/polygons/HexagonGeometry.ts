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
     * Отношение высоты шестиугольника к его стороне.
     */
    public static readonly heightToSideRatio: number = Math.sqrt(3);

    public readonly geometryType: TileGeometryType = TileGeometryType.Hexagon;
    /**
     * Высота шестиугольника.
     */
    public readonly height: number;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, 6, sideToBaseValueRatio);

        this.height = this.side * HexagonGeometry.heightToSideRatio;

        const heightHalf = this.height / 2.0;
        this.pivotPoint = new Point(this.side, heightHalf);        
        this.defaultBoundingRectangleSize = new Size(this.side * 2, this.height);

        this.circumscribedCircleRadius = this.side;
        this.regularPolygonInitialRotationAngle = Math.PI / 3.0;
        this.hitArea = AdditionalMath.getRegularPolygon(
            new Point(0, 0),
            this.circumscribedCircleRadius,
            6,
            this.regularPolygonInitialRotationAngle
        );
    }
}