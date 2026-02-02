export interface ChangeResult<ValueType> {
    increment: ValueType;
    newCurrentTime: number;
    isCompleted: boolean;
}