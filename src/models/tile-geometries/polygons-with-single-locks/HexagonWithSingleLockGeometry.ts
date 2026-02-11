import { AdditionalMath } from "../../../math/AdditionalMath.ts";
import { Size } from "../../../math/Size.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { HexagonGeometry } from "../polygons/HexagonGeometry.ts";
import { TileGeometryType } from "../TileGeometryType.ts";

/**
 * Класс геометрии правильного шестиугольника c одинарными замками.
 * Положением шестиугольника c одинарными замками по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX,
 * первый замок-выпуклость находится на верхней стороне,
 * ему противопоставлен замок-впадина на нижней стороне.
 * Таким образом, в ширину фигура остаётся такой же, как правильный шестиугольник
 * (замки на боковых сторонах не влияют на ширину),
 * а по высоте увеличивается на высоту одного одинарного замка-выпуклости.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class HexagonWithSingleLockGeometry extends HexagonGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.HexagonWithSingleLock;
    public readonly lockType: TileLockType = TileLockType.Single;

    public svgViewBoxSize: Size = new Size(283.5, 284);
    public svgPath?: string =
        `M41.4,117.7c-2-4.5-7.2-6.5-11.7-4.5c-1.7,0.8-3.1,2-4.1,3.7c0,0-25.6,44.4-25.6,44.4l25.6,44.4
        c0.9,1.6,1.3,3.5,1.1,5.4c-0.5,4.9-4.9,8.4-9.7,7.9c-8.5-0.9-16,5.3-16.9,13.7s5.3,16,13.7,16.9c6.6,0.7,13-3,15.7-9
        c0.8-1.7,2-3.1,3.7-4.1c4.2-2.4,9.7-1,12.1,3.2c0,0,25.6,44.4,25.6,44.4h51.2c4.9,0,8.9-4,8.9-8.9c0-1.9-0.6-3.7-1.7-5.2
        c-3.9-5.4-3.9-12.7,0-18.1c5-6.9,14.6-8.4,21.5-3.4c6.9,5,8.4,14.6,3.4,21.5c-2.9,4-2,9.5,2,12.4c1.5,1.1,3.3,1.7,5.2,1.7
        c0,0,51.2,0,51.2,0l25.6-44.4c0.9-1.6,2.4-2.9,4.1-3.7c4.5-2,9.7,0,11.7,4.5c3.5,7.8,12.6,11.3,20.4,7.8
        c7.8-3.5,11.3-12.6,7.8-20.4c-2.7-6.1-9-9.7-15.7-9c-1.9,0.2-3.7-0.2-5.4-1.1c-4.2-2.4-5.7-7.9-3.2-12.1c0,0,25.6-44.4,25.6-44.4
        l-25.6-44.4c-2.4-4.2-7.9-5.7-12.1-3.2c-1.6,0.9-2.9,2.4-3.7,4.1c-2.7,6.1-9,9.7-15.7,9c-8.5-0.9-14.6-8.5-13.7-16.9
        c0.9-8.5,8.5-14.6,16.9-13.7c4.9,0.5,9.2-3,9.7-7.9c0.2-1.9-0.2-3.7-1.1-5.4c0,0-25.6-44.4-25.6-44.4h-51.2c-1.9,0-3.7-0.6-5.2-1.7
        c-4-2.9-4.8-8.4-2-12.4c5-6.9,3.5-16.5-3.4-21.5s-16.5-3.5-21.5,3.4c-3.9,5.4-3.9,12.7,0,18.1c1.1,1.5,1.7,3.3,1.7,5.2
        c0,4.9-4,8.9-8.9,8.9c0,0-51.2,0-51.2,0L45.3,82.9c-2.4,4.2-1,9.7,3.2,12.1c1.6,0.9,3.5,1.3,5.4,1.1c6.6-0.7,13,3,15.7,9
        c3.5,7.8,0,16.9-7.8,20.4C54,129,44.9,125.5,41.4,117.7z`;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, sideToBaseValueRatio);

        this.setLockHeight();

        this.freedomDegree = 3;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        this.pivotPoint.y += this.lockHeight;
        this.defaultBoundingRectangleSize.height += this.lockHeight;
        this.hitArea = AdditionalMath.getRegularPolygon(
            this.pivotPoint,
            this.circumscribedCircleRadius,
            6,
            this.regularPolygonInitialRotationAngle
        );
    }
}