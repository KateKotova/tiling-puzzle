import { GraphicsPath } from "pixi.js";

/**
 * Класс runtime-подмен методов прототипа GraphicsPath без изменения исходников.
 */
export class GraphicsPathMonkeyPatches {
    private static transformIsApplied: boolean = false;

    private constructor() {
    }

    /**
     * Применение обходного решения для ошибки #11988 в PixiJS.
     * Метод GraphicsPath.transform() в PixiJS вызывает сбой при обработке путей,
     * содержащих closePath.
     * Перед вызовом оригинального метода временно удаляем closePath,
     * а затем восстанавливаем исходный массив инструкций.
     * 
     * @see https://github.com/pixijs/pixijs/issues/11988
     */
    public static applyTransformMonkeyPatch(): void {
        if (GraphicsPathMonkeyPatches.transformIsApplied) {
            return;
        }
        
        const originalTransform = GraphicsPath.prototype.transform;
        
        GraphicsPath.prototype.transform = function(matrix) {
            const originalInstructions = this.instructions;
            
            // Временно убираем closePath
            this.instructions = originalInstructions.filter(instruction =>
                instruction.action !== 'closePath');
            
            try {
                originalTransform.call(this, matrix);
            } finally {
                // Возвращаем closePath
                this.instructions = originalInstructions;
            }

            return this;
        };

        GraphicsPathMonkeyPatches.transformIsApplied = true;
    }    
}