/**
 * Класс изменений величины, произошедших с течением времени
 */
export interface OverTimeValueChangeResult<ValueType> {
    valueIncrement: ValueType;
    newCurrentTime: number;
    valueChangeIsCompleted: boolean;
}