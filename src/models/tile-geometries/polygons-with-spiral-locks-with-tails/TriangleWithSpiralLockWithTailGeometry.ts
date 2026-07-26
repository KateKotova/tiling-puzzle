import { Point } from "pixi.js";
import { Size } from "../../../math/Size.ts";
import { TileLockType } from "../../tile-locks/TileLockType.ts";
import { TriangleBaseGeometry } from "../polygon-bases/TriangleBaseGeometry.ts";
import { TileGeometryType } from "../TileGeometryType.ts";
import { TileLockHeightToBaseValueRatios } from "../../tile-locks/TileLockHeightToBaseValueRatios.ts";

/**
 * Класс геометрии треугольника со спиральными замками с хвостиками.
 * Положением треугольника со спиральными замками с хвостиками
 * по умолчанию будем считать, когда нижняя сторона параллельна оси OX,
 * а вверху находится первая вершина треугольника,
 * При этом замки располагаются на всех сторонах.
 * Замок имеет сложную форму и подменяет форму стороны, бывшую ранее отрезком.
 * Замок возвышается не только над центральной частью стороны, но и около вершин.
 * Поэтому для начального положения вводятся дополнительные коэффициенты
 * высоты замка для каждой из вершин.
 * Локальная система координат: начало координат - в левом верхнем углу,
 * ось OX направлена вправо, ось OY направлена вниз.
 * Потом начало координат переместится в точку опоры.
 */
export class TriangleWithSpiralLockWithTailGeometry extends TriangleBaseGeometry {
    public readonly geometryType: TileGeometryType
        = TileGeometryType.TriangleWithSpiralLockWithTail;
    public readonly lockType: TileLockType = TileLockType.SpiralWithTail;
    
    public svgViewBoxSize: Size = new Size(149.5, 140.5);
    public svgPath?: string =
        `M15.6,140.5c19.5,0.2,31.2-31.5,50.7-31.3c1.5,0,3.1,0.2,4.5,0.7c2.4,0.8,4.6,2.2,6.2,4.2
c1.3,1.7,2.2,3.7,2.4,5.8c0.1,1.7-0.2,3.5-1.2,5c-0.7,1.2-1.8,2.1-3.2,2.5c-1.1,0.3-2.3,0.3-3.1-0.3c-0.6-0.5-0.9-1.3-1.2-2.2
s-0.6-1.7-1.2-2.2c-0.8-0.6-2-0.6-3.1-0.3c-1.4,0.4-2.4,1.3-3.2,2.5c-0.9,1.5-1.3,3.3-1.2,5c0.2,2.1,1.1,4.2,2.4,5.8
c1.6,2,3.8,3.4,6.2,4.2c1.5,0.5,3,0.7,4.5,0.7c19.5,0.2,31.2-31.5,50.7-31.3c8.6,0,15.6,7,15.6,15.6c7.5-4.3,10-13.9,5.7-21.3
c-9.6-17-42.8-11.2-52.4-28.3c-0.7-1.3-1.3-2.8-1.7-4.3c-0.6-2.5-0.4-5.1,0.5-7.5c0.8-2,2.1-3.8,3.8-5c1.4-1,3.2-1.6,4.9-1.5
c1.4,0,2.7,0.5,3.7,1.5c0.8,0.8,1.4,1.9,1.2,2.8c-0.1,0.8-0.7,1.5-1.2,2.2c-0.6,0.7-1.1,1.4-1.2,2.2c-0.1,1,0.5,2.1,1.2,2.8
c1,1,2.4,1.4,3.7,1.5c1.7,0.1,3.5-0.5,4.9-1.5c1.8-1.2,3.1-3,3.8-5c0.9-2.4,1-5,0.5-7.5c-0.3-1.5-0.9-3-1.7-4.3
c-9.6-17-42.8-11.2-52.4-28.3c-4.3-7.5-1.8-17,5.7-21.3c-7.5-4.3-17-1.8-21.3,5.7c-10,16.8,11.7,42.7,1.7,59.5
c-0.8,1.3-1.7,2.5-2.9,3.6c-1.9,1.7-4.2,2.9-6.7,3.3c-2.1,0.3-4.3,0.1-6.2-0.8c-1.6-0.8-2.9-2-3.7-3.5c-0.6-1.2-0.9-2.6-0.6-4
c0.3-1.1,0.9-2.1,1.8-2.5c0.7-0.3,1.6-0.1,2.5,0c0.9,0.1,1.8,0.3,2.5,0c0.9-0.4,1.6-1.4,1.8-2.5c0.4-1.4,0.1-2.8-0.6-4
c-0.8-1.5-2.2-2.7-3.7-3.5c-1.9-0.9-4.1-1.2-6.2-0.8c-2.5,0.4-4.9,1.6-6.7,3.3c-1.1,1-2.1,2.3-2.9,3.6c-10,16.8,11.7,42.7,1.7,59.5
c-4.3,7.5-13.9,10-21.3,5.7C0,133.5,7,140.5,15.6,140.5z`;

    /**
     * Отношение высоты замка у верхней вершины треугольника
     * в положении по умолчанию к стороне
     */
    public static readonly defaultTopVertexLockHeightToSideRatio: number
        = 0.73863566 / 50.0;
    /**
     * Отношение высоты замка у правой вершины треугольника
     * в положении по умолчанию к стороне
     */
    public static readonly defaultRightVertexLockHeightToSideRatio: number
        = 2.75662582 / 50.0;
    /**
     * Отношение высоты замка у левой вершины треугольника
     * в положении по умолчанию к стороне
     */
    public static readonly defaultLeftVertexLockHeightToSideRatio: number = 0;    
    /**
     * Отношение максимальной горизонтальной высоты замка в положении по умолчанию
     * к стороне
     */
    public static readonly defaultHorizontalMaxLockHeightToSideRatio: number = Math.max(
        TriangleWithSpiralLockWithTailGeometry.defaultRightVertexLockHeightToSideRatio,
        TriangleWithSpiralLockWithTailGeometry.defaultLeftVertexLockHeightToSideRatio   
    );
    /**
     * Отношение максимальной вертикальной высоты замка в положении по умолчанию
     * к стороне
     */
    public static readonly defaultVerticalMaxLockHeightToSideRatio: number = Math.max(
        TileLockHeightToBaseValueRatios[TileLockType.SpiralWithTail],
        TriangleWithSpiralLockWithTailGeometry.defaultTopVertexLockHeightToSideRatio   
    );

    private defaultTopVertexLockHeight: number = 0;
    private defaultRightVertexLockHeight: number = 0;
    private defaultLeftVertexLockHeight: number = 0;
    public defaultHorizontalMaxLockHeight: number = 0;
    public defaultVerticalMaxLockHeight: number = 0; 

    /**
     * Отношение радиуса описанной окружности треугольника c замками включительно
     * к стороне
     */
    private static readonly circumscribedCircleRadiusWithLocksToSideRatio: number
        = 29.76333814 / 50.0;

    constructor(
        baseValue: number,
        sideToBaseValueRatio: number = 1,
        hitAreaSizeMultiplier: number = 1
    ) {
        super(baseValue, sideToBaseValueRatio);

        this.freedomDegree = this.sideCount;
        this.freedomDegreeRotationAngle = this.getFreedomDegreeRotationAngle();

        this.setLockHeight();

        const sideHalf = this.side / 2.0;
        this.pivotPoint = new Point(sideHalf + this.defaultLeftVertexLockHeight,
            this.circumscribedCircleRadius + this.defaultTopVertexLockHeight);
        this.defaultBoundingRectangleSize = new Size(
            this.side + this.defaultLeftVertexLockHeight + this.defaultRightVertexLockHeight,
            this.height + this.defaultTopVertexLockHeight + this.lockHeight
        );
        this.hitArea = this.getHitAreaRegularPolygon(hitAreaSizeMultiplier);
        this.maxBoundingSize = TriangleWithSpiralLockWithTailGeometry
            .circumscribedCircleRadiusWithLocksToSideRatio
            * this.side * 2;
    }

    protected setLockHeight(): void {
        super.setLockHeight();

        this.defaultTopVertexLockHeight = this.side
            * TriangleWithSpiralLockWithTailGeometry.defaultTopVertexLockHeightToSideRatio;
        this.defaultRightVertexLockHeight = this.side
            * TriangleWithSpiralLockWithTailGeometry.defaultRightVertexLockHeightToSideRatio;
        this.defaultLeftVertexLockHeight = this.side
            * TriangleWithSpiralLockWithTailGeometry.defaultLeftVertexLockHeightToSideRatio;
        this.defaultHorizontalMaxLockHeight = this.side
            * TriangleWithSpiralLockWithTailGeometry.defaultHorizontalMaxLockHeightToSideRatio;
        this.defaultVerticalMaxLockHeight = this.side
            * TriangleWithSpiralLockWithTailGeometry.defaultVerticalMaxLockHeightToSideRatio;
    }
}