import { GlowFilterOptions } from "pixi-filters";

/**
 * Интерфейс параметров неподвижного элемента замощения
 */
export interface StaticTileParameters {
    targetGlowFilterOptions: GlowFilterOptions;
    /**
     * Прозрачность по умолчанию, достаточная,
     * чтобы оригинальное изображение было не видно под статической фигурой-ячейкой
     */
    defaultAlpha: number;
    /**
     * Прозрачность, которая устанавливается для подсказки,
     * чтобы оригинальное изображение проглядывало из-под статической фигуры-ячейки
     */
    hintAlpha: number;
}