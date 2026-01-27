import { Renderer } from "pixi.js";
import { RectangularGridTilingModel } from "./RectangularGridTilingModel.ts";
import { TilingType } from "./TilingType.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { SquareTilingModel } from "../polygons/tilings/SquareTilingModel.ts";
import { TriangleTilingModel } from "../polygons/tilings/TriangleTilingModel.ts";
import { HexagonTilingModel } from "../polygons/tilings/HexagonTilingModel.ts";
import { OctagonAndSquareTilingModel } from "../polygons/tilings/OctagonAndSquareTilingModel.ts";
import { SquareWithSingleLockTilingModel } from "../polygons/tilings/SquareWithSingleLockTilingModel.ts";

export class RectangularGridTilingModelFactory {
    public getTilingModel(tilingType: TilingType,
        textureMinSideTileCount: number,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ): RectangularGridTilingModel | null {
        let tilingModel: RectangularGridTilingModel | null = null;
        const textureMinSideTilePairCount = Math.trunc(textureMinSideTileCount / 2);
        switch (tilingType) {
            case TilingType.Square:
                tilingModel = new SquareTilingModel(textureModel, textureMinSideTileCount,
                    imageContainerModel, renderer);
                break;
            case TilingType.Triangle:
                tilingModel = new TriangleTilingModel(textureModel, textureMinSideTilePairCount,
                    imageContainerModel, renderer);
                break;
            case TilingType.Hexagon:
                tilingModel = new HexagonTilingModel(textureModel, textureMinSideTilePairCount,
                    imageContainerModel, renderer);
                break;
            case TilingType.OctagonAndSquare:
                tilingModel = new OctagonAndSquareTilingModel(textureModel, textureMinSideTileCount,
                    imageContainerModel, renderer);
                break;
            case TilingType.SquareWithSingleLock:
                tilingModel = new SquareWithSingleLockTilingModel(textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            default:
                break;
        }

        if (tilingModel) {
            tilingModel.initialize();
        }
        return tilingModel;
    }
}