import { Graphics, Matrix, Renderer, Texture } from "pixi.js";
import { TilingModel } from "./TilingModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TileModel } from "../tiles/TileModel.ts";
import { ModelSettings } from "../ModelSettings.ts";

export abstract class RectangularGridTilingModel extends TilingModel {

    //#region Texture tile info

    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;

    //#endregion Texture tile info

    private renderer: Renderer;

    constructor(modelSettings: ModelSettings,
        textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        super(modelSettings, textureModel, imageContainerModel);
        this.renderer = renderer;
    }

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.textureTileRowCount
            && columnIndex >= 0
            && columnIndex < this.textureTileColumnCount;
    }

    protected abstract getProtectedTileModel(rowIndex: number, columnIndex: number): TileModel;

    public getTileModel(rowIndex: number, columnIndex: number): TileModel | undefined {
        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);
        if (!this.getGridIndicesAreCorrect(rowIndex, columnIndex)) {
            return undefined;
        }        
        return this.getProtectedTileModel(rowIndex, columnIndex);
    }

    public getTileTexture(tileModel: TileModel): Texture {
        const sideToTextureSideRatio = this.imageContainerModel.sideToTextureSideRatio;
        const boundingRectangleCenterPointX = (tileModel.absoluteBoundingRectangle.x
            + tileModel.absoluteBoundingRectangle.width / 2.0)
            / sideToTextureSideRatio
            + this.textureXTilingOffset;
        const boundingRectangleCenterPointY = (tileModel.absoluteBoundingRectangle.y
            + tileModel.absoluteBoundingRectangle.height / 2.0)
            / sideToTextureSideRatio
            + this.textureYTilingOffset;
        const rotatingBoundingRectangleWidth = tileModel.rotatingBoundingRectangleSize.width
            / sideToTextureSideRatio;
        const rotatingBoundingRectangleHeight = tileModel.rotatingBoundingRectangleSize.height
            / sideToTextureSideRatio;

        const textureMatrix = new Matrix();
        textureMatrix.setTransform(0, 0,
            boundingRectangleCenterPointX, boundingRectangleCenterPointY,
            1, 1,
            -tileModel.rotationAngle,
            0, 0);
        const globalTile = new Graphics()
            .rect(
                -rotatingBoundingRectangleWidth / 2.0,
                -rotatingBoundingRectangleHeight / 2.0,
                rotatingBoundingRectangleWidth,
                rotatingBoundingRectangleHeight
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global",
                matrix: textureMatrix
            });

        const result = this.renderer.generateTexture({
            target: globalTile,
            resolution: 1,
            textureSourceOptions: {
                scaleMode: "nearest"
            }
        });

        globalTile.destroy();
        return result;
    }
}