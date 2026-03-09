import { Matrix, Point, Polygon, Rectangle } from "pixi.js";

/**
 * Класс алгоритмических операций
 */
export class Algorithm {
    /**
     * Метод половинного деления.
     * Поиск индекса сегмента в диапазоне нецелочисленных значений,
     * в который попадает заданное нецелочисленное значение.
     * @param values Массив нецелочисленных значений, которые отсортированы по возрастанию.
     * Соседние из них образуют сегменты.
     * Заданное значение анализируется на предмет попадания в такие сегменты.
     * @param value Значение, которое рассматривается в пределах диапазона.
     * @returns Индекс сегмента, в который попадает заданное значение.
     */
    public static findSegmentIndex(values: number[], value: number): number {
        if (!values.length || value <= values[0]) {
            return 0;
        }

        if (value >= values[values.length - 1]) {
            return values.length - 1;
        }
        
        let leftIndex = 0;
        let rightIndex = values.length - 1;

        while (rightIndex - leftIndex > 1) {
            const middleIndex = Math.floor((leftIndex + rightIndex) / 2);
            
            if (value <= values[middleIndex]) {
                rightIndex = middleIndex;
            } else {
                leftIndex = middleIndex;
            }
        }

        return rightIndex;
    }

    /**
     * Тасовка Фишера-Йетса или перемешивание Кнута.
     * Получение массива, элементы которого перемешаны в произвольном порядке.
     * @param array Исходный массив
     * @returns Новый массив из элементов исходного массива,
     * чьи элементы перемешаны в произвольном порядке
     */
    public static getShuffledArray<ValueType>(array: ValueType[]): ValueType[] {
        const result = [...array];        
        for (let i = result.length - 1; i > 0; i--) {
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
     * Это расстояние может быть как положительным, так и отрицательным.
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
            
            const transformedPoint = matrix.apply(new Point(x, y));
            transformedPoints.push(transformedPoint.x, transformedPoint.y);
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

        // Пускаем луч из точки и считаем, сколько раз он пересекает границы многоугольника.
        // Если число пересечений нечётное, то точка внутри, если чётное, то снаружи.
        
        const x = point.x;
        const y = point.y;
        let result = false;

        // Вершины многоугольника пронумерованы по кругу,
        // где индекс первой вершины - 0, второй - 1 и так далее.
        // Последняя вершина имеет индекс points.length - 1.
        // Вершине с индексом 1 предшествует вершина с индексом 0.
        // Вершине с индексом 0 предшествует вершина с индексом points.length - 1,
        // потому что вершины идут по кругу.
        for (
            let currentVertexIndex = 0,
            previousVertexIndex = points.length - 1;
            currentVertexIndex < points.length;
            previousVertexIndex = currentVertexIndex++
        ) {
            const currentVertexX = points[currentVertexIndex * 2];
            const currentVertexY = points[currentVertexIndex * 2 + 1];
            const previousVertexX = points[previousVertexIndex * 2];
            const previousVertexY = points[previousVertexIndex * 2 + 1];
            
            // Операция XOR.
            // Признак того, что ордината точки находится между вершинами ребра.
            // Одна вершина должна быть выше точки, другая - ниже или наоборот.
            // Если обе точки выше или обе ниже, то луч не пересекает ребро.
            const yIsBetweenVertices = (currentVertexY > y) !== (previousVertexY > y);

            const xEdgeProjection = previousVertexX - currentVertexX;
            const yEdgeProjection = previousVertexY - currentVertexY;
            const pointToCurrentVertexYDistance = y - currentVertexY;

            const intersectionX = currentVertexX + xEdgeProjection
                * pointToCurrentVertexYDistance / yEdgeProjection;
            // Признак того, что точка находится слева от ребра.
            // Здесь луч идёт вправо.
            const xIsAtTheLeftFromEdge = x < intersectionX;

            const intersects = yIsBetweenVertices && xIsAtTheLeftFromEdge;
            // Каждое пересечение меняет четность.
            // Мы идём по лучу из бесконечности к точке.
            // Стартуем снаружи (чётное число пересечений - 0),
            // встречаем границу, пересекаем, теперь мы внутри (нечётное число пересечений - 1),
            // встречаем еще границу, пересекаем, теперь мы снаружи (нечётное число пересечений - 2)
            // и так далее.
            // Когда достигнута проверяемая точка, то граница пересечена оказывается
            // нечётное количество раз, то есть точка внутри.
            if (intersects) {
                result = !result;
            }
        }
        
        return result;
    }
}