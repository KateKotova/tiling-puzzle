/**
 * Класс, определяющий позицию элемента замощения в замощении.
 */
export class TilePosition {
    /**
     * Индекс удалённости данной позиции от края картинки.
     * Неотрицательное целое число (от нуля).
     */
    public edgeDistanceIndex: number = 0;

    public clone(): TilePosition {
        const result = new TilePosition();
        result.edgeDistanceIndex = this.edgeDistanceIndex;
        return result;
    }

    /**
     * Преобразование в строковое представление.
     * Необходимо для быстрого сравнения значений без создания и хранения объектов.
     * @returns Строковое выражение, однозначно определяющее данную позицию
     * без учёта индекса удалённости данной позиции от края картинки.
     */
    public toString(): string {
        return "TilePosition";
    }
}