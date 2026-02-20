import { Point } from "pixi.js";
import { AdditionalMath } from "../../../math/AdditionalMath.ts";
import { Size } from "../../../math/Size.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { OctagonBaseGeometry } from "../polygon-bases/OctagonBaseGeometry.ts";
import { TileGeometryType } from "../TileGeometryType.ts";

/**
 * Класс геометрии правильного восьмиугольника c одинарными замками.
 * Положением восьмиугольника c одинарными замками по умолчанию будем считать,
 * когда две стороны, верхняя и нижняя, параллельны оси OX
 * и две стороны, левая и правая, параллельны оси OY,
 * замки-выпуклости находятся на горизонтальных и вертикальных сторонах,
 * замки-впадины находятся на диагональных сторонах.
 * Таким образом, по сравнению с правильным восьмиугольником,
 * по ширине и высоте фигура увеличится на высоту двух одинарных замков-выпуклостей.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class OctagonWithSingleLockGeometry extends OctagonBaseGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.OctagonWithSingleLock;
    public readonly lockType: TileLockType = TileLockType.Single;

    public svgViewBoxSize: Size = new Size(419.2, 419.2);
    public svgPath?: string =
        `M222.1,24.5c5-6.9,3.5-16.5-3.4-21.5c-6.9-5-16.5-3.5-21.5,3.4c-3.9,5.4-3.9,12.7,0,18.1
        c1.1,1.5,1.7,3.3,1.7,5.2c0,4.9-4,8.9-8.9,8.9c0,0-51.2,0-51.2,0l-36.2,36.2c-3.5,3.5-3.5,9.1,0,12.5c1.3,1.3,3,2.2,4.9,2.5
        c6.6,1,11.7,6.2,12.8,12.8c1.3,8.4-4.4,16.3-12.8,17.6c-8.4,1.3-16.3-4.4-17.6-12.8c-0.8-4.8-5.3-8.1-10.2-7.4
        c-1.8,0.3-3.6,1.2-4.9,2.5c0,0-36.2,36.2-36.2,36.2V190c0,1.9-0.6,3.7-1.7,5.2c-2.9,4-8.4,4.8-12.4,2c-6.9-5-16.5-3.5-21.5,3.4
        s-3.5,16.5,3.4,21.5c5.4,3.9,12.7,3.9,18.1,0c1.5-1.1,3.3-1.7,5.2-1.7c4.9,0,8.9,4,8.9,8.9c0,0,0,51.2,0,51.2l36.2,36.2
        c3.5,3.5,9.1,3.5,12.5,0c1.3-1.3,2.2-3,2.5-4.9c1-6.6,6.2-11.7,12.8-12.8c8.4-1.3,16.3,4.4,17.6,12.8c1.3,8.4-4.4,16.3-12.8,17.6
        c-4.8,0.8-8.1,5.3-7.4,10.2c0.3,1.8,1.2,3.6,2.5,4.9c0,0,36.2,36.2,36.2,36.2H190c1.9,0,3.7,0.6,5.2,1.7c4,2.9,4.8,8.4,2,12.4
        c-5,6.9-3.5,16.5,3.4,21.5s16.5,3.5,21.5-3.4c3.9-5.4,3.9-12.7,0-18.1c-1.1-1.5-1.7-3.3-1.7-5.2c0-4.9,4-8.9,8.9-8.9
        c0,0,51.2,0,51.2,0l36.2-36.2c3.5-3.5,3.5-9.1,0-12.5c-1.3-1.3-3-2.2-4.9-2.5c-6.6-1-11.7-6.2-12.8-12.8
        c-1.3-8.4,4.4-16.3,12.8-17.6c8.4-1.3,16.3,4.4,17.6,12.8c0.8,4.8,5.3,8.1,10.2,7.4c1.8-0.3,3.6-1.2,4.9-2.5
        c0,0,36.2-36.2,36.2-36.2v-51.2c0-1.9,0.6-3.7,1.7-5.2c2.9-4,8.4-4.8,12.4-2c6.9,5,16.5,3.5,21.5-3.4c5-6.9,3.5-16.5-3.4-21.5
        c-5.4-3.9-12.7-3.9-18.1,0c-1.5,1.1-3.3,1.7-5.2,1.7c-4.9,0-8.9-4-8.9-8.9c0,0,0-51.2,0-51.2l-36.2-36.2c-3.5-3.5-9.1-3.5-12.5,0
        c-1.3,1.3-2.2,3-2.5,4.9c-1,6.6-6.2,11.7-12.8,12.8c-8.4,1.3-16.3-4.4-17.6-12.8c-1.3-8.4,4.4-16.3,12.8-17.6
        c4.8-0.8,8.1-5.3,7.4-10.2c-0.3-1.8-1.2-3.6-2.5-4.9l-36.2-36.2c0,0-51.2,0-51.2,0c-1.9,0-3.7-0.6-5.2-1.7
        C220.1,34,219.2,28.4,222.1,24.5z`;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount / 2;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        this.setLockHeight();

        const defaultBoundingRectangleSideHalf = this.inscribedCircleRadius + this.lockHeight;
        this.pivotPoint = new Point(
            defaultBoundingRectangleSideHalf,
            defaultBoundingRectangleSideHalf
        );
        const defaultBoundingRectangleSide = defaultBoundingRectangleSideHalf * 2;
        this.defaultBoundingRectangleSize = new Size(
            defaultBoundingRectangleSide,
            defaultBoundingRectangleSide
        );
        this.hitArea = AdditionalMath.getRegularPolygon(
            this.pivotPoint,
            this.circumscribedCircleRadius,
            8,
            this.regularPolygonInitialRotationAngle
        );
        this.maxBoundingSize = Math.max(
            2 * this.circumscribedCircleRadius,
            2 * (this.inscribedCircleRadius + this.lockHeight)
        );
    }
}