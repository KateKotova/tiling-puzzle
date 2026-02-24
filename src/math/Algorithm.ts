import { Matrix, Point, Polygon, Rectangle } from "pixi.js";

/**
 * Класс алгоритмических операций
 */
export class Algorithm {
    /**
     * Тасовка Фишера-Йетса или перемешивание Кнута.
     * Получение массива, элементы которого перемешаны в произвольном порядке.
     * @param array Исходный массив
     * @returns Новый массив из элементов исходного массива,
     * чьи элементы перемешаны в произвольном порядке
     */
    public static getShuffledArray<T>(array: T[]): T[] {
        const result = [...array];        
        for (let i = result.length - 1; i > 0; i--) {
            // Случайный индекс от 0 до i
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }        
        return result;
    }

    /**
     * Евклидово расстояние.
     * Получение расстояния между точками.
     * @param point1 Первая точка
     * @param point2 Вторая точка
     * @returns Расстояние между точками, неотрицательное число
     */
    public static getPointDistance(point1: Point, point2: Point): number {
        const xOffset = point2.x - point1.x;
        const yOffset = point2.y - point1.y;
        return Math.sqrt(xOffset * xOffset + yOffset * yOffset);
    }

    /**
     * Угол между векторами через скалярное произведение.
     * Получение угла между векторами.
     * @param vector1 Первый вектор
     * @param vector2 Второй вектор
     * @returns Угол между векторами в радианах от 0 до Pi
     */
    public static getAngleBetweenVectors(vector1: Point, vector2: Point): number {
        // Скалярное произведение
        const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
        // Длины векторов
        const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
        
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }
        
        const cos = dotProduct / (magnitude1 * magnitude2);
        return Math.acos(Math.max(-1, Math.min(1, cos)));
    }

    /**
     * Получение угла, нормализованного в диапазоне [0, 2 * Pi),
     * то есть от нуля включительно до двух Pi не включительно.
     * @param angle Угол в радианах
     * @returns Нормализованный угол в радианах
     */
    public static getNormalizedAngle(angle: number): number {
        const doublePi = 2 * Math.PI;
        let result = angle % doublePi;
        if (result < 0) {
            result += doublePi;
        }
        return result;
    }

    /**
     * Алгоритм вычисления кратчайшей разницы углов.
     * Получение расстояния между двумя нормализованными углами.
     * Это расстояние может быть как положительнымЮ так и отрицательным.
     * Главное, по модулю оно является минимальным.
     * @param sourceNormalizedAngle Исходный угол в радианах
     * @param targetNormalizedAngle Целевой угол в радианах
     * @returns Минимальное расстояние между углами
     */
    public static getMinAngleDifference(
        sourceNormalizedAngle: number,
        targetNormalizedAngle: number
    ): number {
        const doublePi = 2 * Math.PI;
        const angleDifference1 = targetNormalizedAngle - sourceNormalizedAngle;
        const angleDifference2 = angleDifference1
            + doublePi * (angleDifference1 >= 0 ? -1 : 1);
        return Math.abs(angleDifference1) <= Math.abs(angleDifference2)
            ? angleDifference1
            : angleDifference2;
    }

    /**
     * Алгоритм построения правильного многоугольника по описанной окружности.
     * Получение правильного многоугольника.
     * @param circumscribedCircleCenterPoint Центр описанной окружности 
     * @param circumscribedCircleRadius Радиус описанной окружности
     * @param sideCount Количество сторон
     * @param rotationAngle Угол поворота в радианах.
     * Он отсчитывается от начального положения: -Pi / 2 (то есть -90 градусов),
     * когда первая вершина многоугольника смотрит вверх.
     * Для положительного угла поворот будет против часовой стрелки.
     * Для отрицательного угла поворот будет по часовой стрелки
     * @returns Полигон с направлением обхода вершин по часовой стрелке,
     * что является стандартом для PixiJS.
     */
    public static getRegularPolygon(
        circumscribedCircleCenterPoint: Point,
        circumscribedCircleRadius: number,
        sideCount: number,
        rotationAngle: number = 0
    ): Polygon {
        if (sideCount < 3) {
            throw new Error('sideCount should not be less then 3');
        }
        if (circumscribedCircleRadius <= 0) {
            throw new Error('circumscribedCircleRadius should be positive');
        }

        const points: number[] = [];
        const angleStep = (2 * Math.PI) / sideCount;
        
        for (let i = 0; i < sideCount; i++) {
            const angle = -Math.PI / 2 + i * angleStep + rotationAngle;
            
            const x = circumscribedCircleCenterPoint.x + circumscribedCircleRadius
                * Math.cos(angle);
            const y = circumscribedCircleCenterPoint.y + circumscribedCircleRadius
                * Math.sin(angle);
            
            points.push(x, y);
        }
        
        return new Polygon(points);
    }

    /**
     * Алгоритм трансформации полигона или аффинное преобразование полигона.
     * Получение преобразованного многоугольника.
     * @param polygon Исходный многоугольник
     * @param matrix Матрица трансформации
     * @returns Новый многоугольник с преобразованными координатами
     */
    public static getTransformedPolygon(
        polygon: Polygon,
        matrix: Matrix
    ): Polygon {
        const points = polygon.points;
        const transformedPoints: number[] = [];

        for (let i = 0; i < points.length; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            
            const transformed = matrix.apply(new Point(x, y));
            transformedPoints.push(transformed.x, transformed.y);
        }
        
        return new Polygon(transformedPoints);
    }

    /**
     * Признак того, что точка находится внутри прямоугольника
     * @param point Точка
     * @param rectangle Прямоугольник
     * @returns true, если точка внутри, false, если точка снаружи
     */
    public static getPointIsInsideRectangle(point: Point, rectangle: Rectangle): boolean {
        return point.x >= rectangle.x
            && point.y >= rectangle.y
            && point.x <= rectangle.x + rectangle.width
            && point.y <= rectangle.y + rectangle.height;
    }

    /**
     * Алгоритм подсчёта пересечений или алгоритм чётности (Ray casting algorithm).
     * Признак того, что точка находится внутри многоугольника.
     * @param point Точка
     * @param polygon Многоугольник
     * @returns true, если точка внутри, false, если точка снаружи
     */
    public static getPointIsInsidePolygon(point: Point, polygon: Polygon): boolean {
        const points = polygon.points;
        if (points.length < 3) {
            return false;
        }
        
        const x = point.x;
        const y = point.y;
        let result = false;
        
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i * 2];
            const yi = points[i * 2 + 1];
            const xj = points[j * 2];
            const yj = points[j * 2 + 1];
            
            const intersects = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersects) {
                result = !result;
            }
        }
        
        return result;
    }
}