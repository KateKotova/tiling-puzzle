import { TileLockType } from "./TileLockType.ts";

export const TileLockHeightToSideRatios = {
    [TileLockType.Unknown]: 0,
    [TileLockType.None]: 0,
    [TileLockType.Single]: 13.592640 / 50.0
} as const;