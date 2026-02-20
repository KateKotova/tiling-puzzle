import { Container, ContainerChild, ContainerOptions } from "pixi.js";
import { TileLineDirectionType } from "./TileLineDirectionType.ts";

/**
 * Класс контейнера линии, в которой содержатся элементы мозаики для сборки.
 * Может быть вертикальной (сверху вниз) или горизонтальной (слева направо).
 */
export class TileLineContainer extends Container {
    public readonly directionType: TileLineDirectionType;
    /**
     * Продольный отступ содержимого от края.
     * Для направления слева направо этот отступ применяется слева и справа.
     * Для направления сверху вниз этот отступ применяется сверху и снизу.
     */
    public longitudinalContentOffset: number = 0;
    /**
     * Поперечный отступ содержимого от края.
     * Для направления слева направо этот отступ применяется сверху и снизу.
     * Для направления сверху вниз этот отступ применяется слева и справа.
     */
    public transverseContentOffset: number = 0;
    /**
     * Отступ между элементами мозаики.
     */
    public betweenTilesOffset: number = 0;

    constructor(
        directionType: TileLineDirectionType,
        options?: ContainerOptions<ContainerChild>        
    ) {
        super(options);
        this.directionType = directionType;
    }
}