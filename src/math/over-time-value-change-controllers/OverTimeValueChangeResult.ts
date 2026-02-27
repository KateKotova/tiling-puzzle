/**
 * Класс изменений величины, произошедших с течением времени
 */
export interface OverTimeValueChangeResult<TValue> {
    valueIncrement: TValue;
    newCurrentTime: number;
    valueChangeIsCompleted: boolean;
}