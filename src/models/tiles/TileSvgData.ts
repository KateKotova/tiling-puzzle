export class TileSvgData {
    public viewBoxWidth: number;
    public viewBoxHeight: number;
    public path: string;

    constructor(viewBoxWidth: number, viewBoxHeight: number, path: string) {
        this.viewBoxWidth = viewBoxWidth;
        this.viewBoxHeight = viewBoxHeight;
        this.path = path;
    }
}