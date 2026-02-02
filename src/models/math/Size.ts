export class Size {
    public width: number = 0;
    public height: number = 0;

    constructor(width: number = 0, height: number = 0) {
        this.width = width;
        this.height = height;
    }

    public clone(): Size {
        return new Size(this.width, this.height);
    }
}