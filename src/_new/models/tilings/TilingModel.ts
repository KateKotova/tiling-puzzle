//import { ModelSettings } from "../ModelSettings";
import { TileLockType } from "../tile-locks/TileLockType";
import { TilingType } from "./TilingType";

/**
 * Класс модели замощения
 */
export abstract class TilingModel {
    public readonly tilingType: TilingType = TilingType.Unknown;
    public readonly lockType: TileLockType = TileLockType.None;

    //protected modelSettings: ModelSettings;
    public isInitialized: boolean = false;
}