import { Point, Polygon } from "pixi.js";
import { TileLockHeightToBaseValueRatios } from "../tile-locks/TileLockHeightToBaseValueRatios.ts";
import { TileLockType } from "../tile-locks/TileLockType.ts";
import { TileGeometryType } from "./TileGeometryType.ts";
import { Size } from "../../math/Size.ts";

/**
 * Класс геометрии элемента замощения.
 * Содержит инструменты для построения.
 * Нескольким элементам замощения может соответствовать один и тот же объект геометрии,
 * если они имеют одинаковую форму и размеры.
 */
export abstract class TileGeometry {
    /**
     * Некоторая базовая величина, на основе которой производятся все расчёты.
     * В замощениях это часто одна сторона одной из фигур.
     * В комплектах фигур это определённо одна сторона одной из фигур.
     */
    public readonly baseValue: number;
    public readonly geometryType: TileGeometryType = TileGeometryType.Unknown;
    public readonly lockType: TileLockType = TileLockType.None;
    public lockHeightToBaseValueRatio: number= 0;
    public lockHeight: number = 0;
    /**
     * Точка опоры для выполнения поворотов и перемещения фигуры
     * в локальной системе координат элемента замощения.
     * В эту точку будет перемещена локальная точка начала координат фигуры.
     */
    public pivotPoint: Point = new Point(0, 0);
    /**
     * Степень свободы элемента замощения, положительное целое число.
     * Означает, сколько раз фигура может быть повёрнута вокруг точки опоры от 0 до 360 градусов,
     * чтобы оставаться в аналогичной форме и положении.
     * То есть сколько разных повёрнутых положений фигура может принять
     * в одной и то же подходящей ей ячейке замощения.
     */
    public freedomDegree: number = 1;
    /**
     * Угол поворота, соответствующий степени свободы элемента замощения.
     * Означает, на какой минимальный угол от 0 до 360 градусов
     * может быть повёрнута фигура вокруг точки опоры,
     * чтобы оставаться в аналогичной форме и положении.
     */
    public freedomDegreeRotationAngle: number = 0;
    /**
     * Размеры границ элемента замощения в положении фигуры по умолчанию.
     */
    public defaultBoundingRectangleSize: Size = new Size();
    /**
     * Строка, записывающаяся в path svg-изображения элемента замощения.
     * Если у фигуры нет svg-изображения, то эта строка будет не определена.
     */
    public svgPath?: string;
    /**
     * Размеры области видимости svg-изображения элемента замощения.
     */
    public svgViewBoxSize: Size = new Size();
    /**
     * Зона попадания в фигуру, упрощённая до замкнутого многоугольника,
     * в локальных координатах элемента замощения в положении фигуры по умолчанию,
     * где точка (0; 0) - это точка опоры фигуры.
     * Направление обхода вершин должно быть по часовой стрелке! Это стандарт PixiJS.
     */
    public hitArea: Polygon = new Polygon();

    constructor(baseValue: number) {
        this.baseValue = baseValue;
    }

    protected setLockHeight() {
        this.lockHeightToBaseValueRatio = TileLockHeightToBaseValueRatios[this.lockType];
        this.lockHeight = this.baseValue * this.lockHeightToBaseValueRatio;
    } 

    protected getFreedomDegreeRotationAngle() {
        return 2 * Math.PI / this.freedomDegree;
    }
}