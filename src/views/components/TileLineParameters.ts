import { TileLineDirectionType } from "./TileLineDirectionType.ts";

/**
 * Интерфейс параметров линии, в которой содержатся элементы мозаики для сборки
 */
export interface TileLineParameters {
    directionType: TileLineDirectionType;
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
}