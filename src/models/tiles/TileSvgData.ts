export class TileSvgData {
    public viewBoxWidth: number;
    public viewBoxHeight: number;
    public freedomDegreeCount: number;
    public path: string;

    constructor(viewBoxWidth: number,
        viewBoxHeight: number,
        freedomDegreeCount: number,
        path: string) {

        this.viewBoxWidth = viewBoxWidth;
        this.viewBoxHeight = viewBoxHeight;
        this.freedomDegreeCount = freedomDegreeCount;
        this.path = path;
    }
}