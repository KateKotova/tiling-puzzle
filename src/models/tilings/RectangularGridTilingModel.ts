import { Graphics, Renderer, Texture } from "pixi.js";
import { TilingType } from "./TilingType.ts";
import { TilingModel } from "./TilingModel.ts";
import { TilingTextureModel } from "../TilingTextureModel.ts";
import { ImageContainerModel } from "../ImageContainerModel.ts";
import { TilingContainerModel } from "../TilingContainerModel.ts";
import { TileModel } from "../tiles/TileModel.ts";

export abstract class RectangularGridTilingModel implements TilingModel {
    public static readonly tilingType: TilingType = TilingType.Unknown;

    //#region Texture tile info

    public textureModel: TilingTextureModel;
    public textureTileColumnCount: number = 0;
    public textureTileRowCount: number = 0;
    protected textureXTilingOffset: number = 0;
    protected textureYTilingOffset: number = 0;

    //#endregion Texture tile info

    public isInitialized: boolean = false;
    protected imageContainerModel: ImageContainerModel;
    public tilingContainerModel: TilingContainerModel | undefined;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;
    }

    public getTilingType(): TilingType {
        return RectangularGridTilingModel.tilingType;
    }

    public initialize(): void {
        this.initializeTextureTileInfo();        
        this.tilingContainerModel = new TilingContainerModel(this.imageContainerModel,
            this.textureXTilingOffset, this.textureYTilingOffset);
        this.initializeImageTileInfo();
        this.isInitialized = true;
    }

    protected abstract initializeTextureTileInfo(): void;

    protected abstract initializeImageTileInfo(): void;

    public getGridIndicesAreCorrect(rowIndex: number, columnIndex: number): boolean {
        return rowIndex >= 0
            && rowIndex < this.textureTileRowCount
            && columnIndex >= 0
            && columnIndex < this.textureTileColumnCount;
    }

    protected abstract getTileModelWithoutTexture(rowIndex: number, columnIndex: number): TileModel;

    public getTileModel(rowIndex: number,
        columnIndex: number,
        shouldGetTexture: boolean = true): TileModel | undefined {

        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);
        if (!this.getGridIndicesAreCorrect(rowIndex, columnIndex)) {
            return undefined;
        }
        
        const result = this.getTileModelWithoutTexture(rowIndex, columnIndex);
        if (shouldGetTexture) {
            result.texture = this.getImageTileTexture(result);
        }

        return result;
    }

    public getImageTileTexture(tileModel: TileModel): Texture {
        const globalTile = new Graphics()
            .rect(
                tileModel.absoluteBoundingRectangle.x
                    / this.imageContainerModel.sideToTextureSideRatio
                    + this.textureXTilingOffset,
                tileModel.absoluteBoundingRectangle.y
                    / this.imageContainerModel.sideToTextureSideRatio
                    + this.textureYTilingOffset,
                tileModel.absoluteBoundingRectangle.width
                    / this.imageContainerModel.sideToTextureSideRatio,
                tileModel.absoluteBoundingRectangle.height
                    / this.imageContainerModel.sideToTextureSideRatio
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global"
            });

        const result = this.renderer.generateTexture(globalTile);
        globalTile.destroy();
        return result;
    }
}