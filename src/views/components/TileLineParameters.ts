import { DraggableTileParameters } from "../tile-decorators/DraggableTileParameters.ts";
import { TileParameters } from "../tiles/TileParameters.ts";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";
import { TileLineLayoutType } from "./TileLineLayoutType.ts";

/**
 * Интерфейс параметров линии, в которой содержатся элементы мозаики для сборки
 */
export interface TileLineParameters {
    directionType: TileLineDirectionType;
    layoutType: TileLineLayoutType;
    /**
     * Продольный отступ содержимого от края.
     * Для направления слева направо этот отступ применяется слева и справа.
     * Для направления сверху вниз этот отступ применяется сверху и снизу.
     */
    longitudinalContentOffset: number;
    /**
     * Поперечный отступ содержимого от края.
     * Для направления слева направо этот отступ применяется сверху и снизу.
     * Для направления сверху вниз этот отступ применяется слева и справа.
     */
    transverseContentOffset: number;
    /**
     * Отступ между элементами мозаики.
     */
    betweenTilesOffset: number;
    tileParameters: TileParameters;
    draggableTileParameters: DraggableTileParameters;
}