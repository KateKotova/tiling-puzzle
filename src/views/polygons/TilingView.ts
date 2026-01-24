import { Container, GraphicsContext } from "pixi.js";
import { TilingModel } from "../../models/TilingModel";
import { RegularPolygonTileModel } from "../../models/polygons/tiles/RegularPolygonTileModel";

export abstract class TilingView {
    public model: TilingModel;
    public tilingContainer: Container;

    constructor(model: TilingModel) {
        this.model = model;
        this.tilingContainer = this.createTilingContainer();
    }

    private createTilingContainer(): Container {
        const rectangle = this.model.tilingContainerModel.boundingRectangle;
        return new Container({
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height
        });
    }

    protected getRegularPolygonTileGraphicsContext(
        tileModel: RegularPolygonTileModel): GraphicsContext {

        return new GraphicsContext()
            .regularPoly(
                tileModel.centerPoint.x,
                tileModel.centerPoint.y,
                tileModel.circumscribedCircleRadius,
                tileModel.sideCount,
                tileModel.rotationAngle
            )
            .stroke({
                color: "black",
                width: 2,
                alpha: 0.7
            });
    }

    public abstract setExampleTiling(): void;
}