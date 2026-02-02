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
import { HexagonWithSingleLockTilingModel } from "../polygons/tilings/HexagonWithSingleLockTilingModel.ts";
import { OctagonAndSquareWithSpiralLockTilingModel } from "../polygons/tilings/OctagonAndSquareWithSpiralLockTilingModel.ts";
import { ModelSettings } from "../ModelSettings.ts";

export class RectangularGridTilingModelFactory {
    public getTilingModel(
        modelSettings: ModelSettings,
        tilingType: TilingType,
        textureMinSideTileCount: number,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer
    ): RectangularGridTilingModel | null {
        let model: RectangularGridTilingModel | null = null;
        const textureMinSideTilePairCount = Math.trunc(textureMinSideTileCount / 2);
        switch (tilingType) {
            case TilingType.Square:
                model = new SquareTilingModel(modelSettings, textureModel, textureMinSideTileCount,
                    imageContainerModel, renderer);
                break;
            case TilingType.Triangle:
                model = new TriangleTilingModel(modelSettings, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.Hexagon:
                model = new HexagonTilingModel(modelSettings, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.OctagonAndSquare:
                model = new OctagonAndSquareTilingModel(modelSettings, textureModel,
                    textureMinSideTileCount, imageContainerModel, renderer);
                break;
            case TilingType.SquareWithSingleLock:
                model = new SquareWithSingleLockTilingModel(modelSettings, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.HexagonWithSingleLock:
                model = new HexagonWithSingleLockTilingModel(modelSettings, textureModel,
                    textureMinSideTilePairCount, imageContainerModel, renderer);
                break;
            case TilingType.OctagonAndSquareWithSingleLock:
                model = new OctagonAndSquareWithSpiralLockTilingModel(modelSettings, textureModel,
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