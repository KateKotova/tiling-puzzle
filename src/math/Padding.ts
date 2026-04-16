/**
 * Класс, представляющий собой отступы: сверху, справа, снизу, слева.
 */
export class Padding {
    public top: number;
    public right: number;
    public bottom: number;
    public left: number;

    constructor(top: number, right: number, bottom: number, left: number) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    public clone(): Padding {
        return new Padding(this.top, this.right, this.bottom, this.left);
    }
}