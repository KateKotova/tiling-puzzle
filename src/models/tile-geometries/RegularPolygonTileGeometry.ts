import { TileGeometry } from "./TileGeometry.ts";

/**
 * Класс геометрии построения элемента замощения, являющегося правильным многоугольником.
 */
export abstract class RegularPolygonTileGeometry extends TileGeometry {
    /**
     * Отношение радиуса описанной окружности правильного многоугольника к его стороне.
     */
    public readonly circumscribedCircleRadiusToSideRatio: number = 1;
    /**
     * Отношение радиуса вписанной окружности правильного многоугольника к его стороне.
     */
    public readonly inscribedCircleRadiusToSideRatio: number = 1;
    /**
     * Отношение стороны правильного многоугольника к базовой величине.
     * По умолчанию сторона правильного многоугольника равна базовой величине.
     */
    public readonly sideToBaseValueRatio: number;
    /**
     * Сторона правильного многоугольника
     */
    public readonly side: number;
    /**
     * Количество сторон правильного многоугольника
     */
    public readonly sideCount: number = 0;
    /**
     * Радиус описанной окружности
     */
    public circumscribedCircleRadius: number = 0;
    /**
     * Радиус вписанной окружности
     */
    public inscribedCircleRadius: number = 0;
    /**
     * Начальный угол вращения в радианах относительно опорной точки.
     * В PixiJS правильный многоугольник строится так, что первая вершина находится вверху,
     * на -90 градусов (-Pi / 2). Положительный угол откладывается против часовой стрелки.
     * Отрицательный угол откладывается по часовой стрелке.
     * У разных фигур в этой программе будут разные исходные положения, и это не всегда
     * положения первым углом вверх, чаще вверху находится горизонтальная сторона.
     * И этот начальный угол необходим для построения, чтобы перейти из позиции, когда угол вверху,
     * в позицию для данной фигуры, установленной по умолчанию.
     */
    public regularPolygonInitialRotationAngle: number = 0;

    constructor(
        baseValue: number,
        sideCount: number,
        sideToBaseValueRatio: number = 1
    ) {
        super(baseValue);
        this.sideCount = sideCount;
        this.sideToBaseValueRatio = sideToBaseValueRatio;
        this.side = this.baseValue * this.sideToBaseValueRatio;
    }

    protected setCircumscribedAndInscribedCircleRadiuses() {
        this.circumscribedCircleRadius = this.side * this.circumscribedCircleRadiusToSideRatio;
        this.inscribedCircleRadius = this.side * this.inscribedCircleRadiusToSideRatio;
    }
}