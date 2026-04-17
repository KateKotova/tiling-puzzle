import { Color, Texture } from "pixi.js";
import { TilingType } from "../../../../models/tilings/TilingType.ts";
import { TilingLayoutStrategyType } from "../../../../models/tilings/TilingLayoutStrategyType.ts";

/**
 * Интерфейс уникальных для данного уровня параметров
 * контейнера изображения для сборки мозаики,
 * которое должно находиться в вертикальном контейнере уровня мозаичного замощения
 */
export interface TilingLevelImageUniqueParameters {
    textureMinSideTileCount: number;
    tilingType: TilingType;
    tilingTexture: Texture;
    tilingLayoutStrategyType: TilingLayoutStrategyType;
    /**
     * Цвет заливки статических элементов замощения по умолчанию
     */
    defaultStaticTileFillColor: Color;
    /**
     * Цвет заливки статических элементов, который устанавливается
     * для фигур того же типа геометрии, что и выбранный перетаскиваемый элемент замощения
     */
    targetStaticTileFillColor: Color;
}