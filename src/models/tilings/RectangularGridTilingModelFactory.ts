import { Renderer } from "pixi.js";
import { RectangularGridTilingModel } from "./RectangularGridTilingModel.ts";
import { TilingType } from "./TilingType.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { HexagonWithSingleLockTilingModel }
    from "./polygons-with-single-locks/HexagonWithSingleLockTilingModel.ts";
import { OctagonAndSquareWithSingleLockTilingModel }
    from "./polygons-with-single-locks/OctagonAndSquareWithSingleLockTilingModel.ts";
import { SquareWithSingleLockTilingModel }
    from "./polygons-with-single-locks/SquareWithSingleLockTilingModel.ts";
import { HexagonTilingModel } from "./polygons/HexagonTilingModel.ts";
import { OctagonAndSquareTilingModel } from "./polygons/OctagonAndSquareTilingModel.ts";
import { SquareTilingModel } from "./polygons/SquareTilingModel.ts";
import { TriangleTilingModel } from "./polygons/TriangleTilingModel.ts";
import { TileParameters } from "../tiles/TileParameters.ts";
import { TriangleWithSpiralLockWithTailTilingModel }
    from "./polygons-with-spiral-locks-with-tails/TriangleWithSpiralLockWithTailTilingModel.ts";

/**
 * Класс фабрики для создания замощения
 */
export class RectangularGridTilingModelFactory {
    public getTilingModel(
        tileParameters: TileParameters,
        tilingType: TilingType,
        textureMinSideTileCount: number,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ): RectangularGridTilingModel | undefined {
        let model: RectangularGridTilingModel | undefined;
        const textureMinSideTilePairCount = Math.trunc(textureMinSideTileCount / 2);
        switch (tilingType) {
            case TilingType.Triangle:
                model = new TriangleTilingModel(tileParameters, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.Square:
                model = new SquareTilingModel(tileParameters, textureModel, textureMinSideTileCount,
                    imageContainerModel, renderer);
                break;
            case TilingType.Hexagon:
                model = new HexagonTilingModel(tileParameters, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.OctagonAndSquare:
                model = new OctagonAndSquareTilingModel(tileParameters, textureModel,
                    textureMinSideTileCount, imageContainerModel, renderer);
                break;
            case TilingType.SquareWithSingleLock:
                model = new SquareWithSingleLockTilingModel(tileParameters, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.HexagonWithSingleLock:
                model = new HexagonWithSingleLockTilingModel(tileParameters, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.OctagonAndSquareWithSingleLock:
                model = new OctagonAndSquareWithSingleLockTilingModel(tileParameters, textureModel,
                    textureMinSideTileCount, imageContainerModel, renderer);
                break;
            case TilingType.TriangleWithSpiralLockWithTail:
                model = new TriangleWithSpiralLockWithTailTilingModel(tileParameters, textureModel,
                    textureMinSideTileCount, imageContainerModel, renderer);
                break;
            default:
                break;
        }

        if (model) {
            model.initialize();
        }
        return model;
    }
}