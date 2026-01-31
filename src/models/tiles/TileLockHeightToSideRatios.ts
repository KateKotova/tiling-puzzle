import { TileLockType } from "./TileLockType.ts";

export const TileLockHeightToSideRatios = {
    [TileLockType.None]: 0,
    [TileLockType.Single]: 13.5926405 / 50.0
} as const;