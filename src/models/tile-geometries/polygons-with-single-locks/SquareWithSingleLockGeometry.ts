import { Point, Polygon } from "pixi.js";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { TileGeometryType } from "../TileGeometryType.ts";
import { Size } from "../../../math/Size.ts";
import { SquareBaseGeometry } from "../polygon-bases/SquareBaseGeometry.ts";

/**
 * Класс геометрии квадрата c одинарными замками.
 * Положением квадрата c одинарными замками по умолчанию будем считать,
 * когда две стороны параллельны оси OX
 * и две стороны параллельны оси OY,
 * замки-выпуклости находятся на горизонтальных сторонах,
 * замки-впадины находятся на вертикальных сторонах.
 * Таким образом, в ширину фигура остаётся такой же, как квадрат,
 * а по высоте увеличивается на высоту двух одинарных замков-выпуклостей.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class SquareWithSingleLockGeometry extends SquareBaseGeometry {
    public readonly geometryType: TileGeometryType = TileGeometryType.SquareWithSingleLock;
    public readonly lockType: TileLockType = TileLockType.Single;

    public svgViewBoxSize: Size = new Size(141.7, 218.8);
    public svgPath?: string =
        `M14.1,121.9c-4-2.9-9.5-2-12.4,2c-1.1,1.5-1.7,3.3-1.7,5.2c0,0,0,51.2,0,51.2h51.2c1.9,0,3.7,0.6,5.2,1.7
        c4,2.9,4.8,8.4,2,12.4c-5,6.9-3.5,16.5,3.4,21.5c6.9,5,16.5,3.5,21.5-3.4c3.9-5.4,3.9-12.7,0-18.1c-1.1-1.5-1.7-3.3-1.7-5.2
        c0-4.9,4-8.9,8.9-8.9c0,0,51.2,0,51.2,0v-51.2c0-4.9-4-8.9-8.9-8.9c-1.9,0-3.7,0.6-5.2,1.7c-5.4,3.9-12.7,3.9-18.1,0
        c-6.9-5-8.4-14.6-3.4-21.5c5-6.9,14.6-8.4,21.5-3.4c4,2.9,9.5,2,12.4-2c1.1-1.5,1.7-3.3,1.7-5.2c0,0,0-51.2,0-51.2H90.5
        c-1.9,0-3.7-0.6-5.2-1.7c-4-2.9-4.8-8.4-2-12.4c5-6.9,3.5-16.5-3.4-21.5c-6.9-5-16.5-3.5-21.5,3.4c-3.9,5.4-3.9,12.7,0,18.1
        c1.1,1.5,1.7,3.3,1.7,5.2c0,4.9-4,8.9-8.9,8.9c0,0-51.2,0-51.2,0v51.2c0,4.9,4,8.9,8.9,8.9c1.9,0,3.7-0.6,5.2-1.7
        c5.4-3.9,12.7-3.9,18.1,0c6.9,5,8.4,14.6,3.4,21.5C30.6,125.3,21,126.9,14.1,121.9z`;

    constructor(baseValue: number, sideToBaseValueRatio: number = 1) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount / 2;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        this.setLockHeight();

        this.pivotPoint.y += this.lockHeight;
        this.defaultBoundingRectangleSize.height += this.lockHeight * 2;
        this.hitArea = new Polygon([
            new Point(0, this.lockHeight),
            new Point(this.side, this.lockHeight),
            new Point(this.side, this.side + this.lockHeight),
            new Point(0, this.side + this.lockHeight)
        ]);
    }
}