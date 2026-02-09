/**
 * Тип геометрии элемента замощения
 */
export enum TileGeometryType {
    /**
     * Неизвестный
     */
    Unknown = "Unknown",
    /**
     * Правильный треугольник
     */
    Triangle = "Triangle",
    /**
     * Квадрат
     */
    Square = "Square",
    /**
     * Правильный шестиугольник
     */
    Hexagon = "Hexagon",
    /**
     * Правильный восьмиугольник
     */
    Octagon = "Octagon",
    /**
     * Квадрат с одинарным замком
     */
    SquareWithSingleLock = "SquareWithSingleLock",
    /**
     * Правильный шестиугольник с одинарным замком
     */
    HexagonWithSingleLock = "HexagonWithSingleLock",
    /**
     * Правильный восьмиугольник с одинарным замком
     */
    OctagonWithSingleLock = "OctagonWithSingleLock"
}