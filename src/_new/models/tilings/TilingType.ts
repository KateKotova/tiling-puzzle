/**
 * Тип замощения
 */
export enum TilingType {
    /**
     * Неизвестный
     */
    Unknown = "Unknown",
    /**
     * Замощение правильными треугольниками
     */
    Triangle = "Triangle",
    /**
     * Замощение квадратами
     */
    Square = "Square",
    /**
     * Замощение квадратами с одинарными замками
     */
    SquareWithSingleLock = "SquareWithSingleLock",
    /**
     * Замощение правильными шестиугольниками
     */
    Hexagon = "Hexagon",
    /**
     * Замощение правильными шестиугольниками с одинарными замками
     */
    HexagonWithSingleLock = "HexagonWithSingleLock",
    /**
     * Замощение правильными восьмиугольниками и квадратами
     */
    OctagonAndSquare = "OctagonAndSquare",
    /**
     * Замощение правильными восьмиугольниками и квадратами с одинарными замками
     */
    OctagonAndSquareWithSingleLock = "OctagonAndSquareWithSingleLock"
}