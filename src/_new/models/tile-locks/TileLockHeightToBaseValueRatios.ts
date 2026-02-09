import { TileLockType } from "./TileLockType.ts";

/**
 * Объект, чьи ключи - типы замков,
 * а каждое значение - отношение высоты замка к некоторой базовой величине,
 * на основе которой производятся все расчёты.
 */
export const TileLockHeightToBaseValueRatios = {
    [TileLockType.None]: 0,
    [TileLockType.Single]: 13.5926405 / 50.0
} as const;