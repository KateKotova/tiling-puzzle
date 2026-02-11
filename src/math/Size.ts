/**
 * Класс, представляющий собой размеры: ширину и высоту
 */
export class Size {
    public width: number;
    public height: number;

    constructor(width: number = 0, height: number = 0) {
        this.width = width;
        this.height = height;
    }

    public clone(): Size {
        return new Size(this.width, this.height);
    }
}