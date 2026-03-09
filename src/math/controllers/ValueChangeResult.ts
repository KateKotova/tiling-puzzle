/**
 * Класс результата изменений величины, произошедших с течением времени
 */
export interface ValueChangeResult<ValueType> {
    valueIncrement: ValueType;
    newCurrentTime: number;
    valueChangeIsCompleted: boolean;
}