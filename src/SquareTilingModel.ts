import { Graphics, Rectangle, Renderer, Texture } from "pixi.js";
import { TilingTextureModel } from "./TilingTextureModel.ts";
import { ImageContainerModel } from "./ImageContainerModel.ts";
import { SquareTileModel } from "./SquareTileModel.ts";

export class SquareTilingModel {
    public textureMinSideSquareCount: number;
    public static readonly textureMinSideMinSquareCount = 2;

    public textureModel: TilingTextureModel;
    private textureSquareSide: number = 0;
    public textureWidthSquareCount: number = 0;
    public textureHeightSquareCount: number = 0;
    private textureXSquaresOffset: number = 0;
    private textureYSquaresOffset: number = 0;

    public imageContainerModel: ImageContainerModel;
    public squaresContainerRectangle: Rectangle = new Rectangle();
    public squareSide: number = 0;

    private renderer: Renderer;

    constructor(textureModel: TilingTextureModel,
        textureMinSideSquareCount: number,
        imageContainerModel: ImageContainerModel,
        renderer: Renderer) {

        this.textureMinSideSquareCount
            = textureMinSideSquareCount < SquareTilingModel.textureMinSideMinSquareCount
                ? SquareTilingModel.textureMinSideMinSquareCount
                : Math.floor(textureMinSideSquareCount);

        this.textureModel = textureModel;
        this.imageContainerModel = imageContainerModel;
        this.renderer = renderer;

        this.initialiazeTextureSquareInfo();        
        this.initialiazeImageSquareInfo();
    }

    private initialiazeTextureSquareInfo(): void {
        this.textureSquareSide = this.textureModel.minSide / this.textureMinSideSquareCount;

        this.textureWidthSquareCount = Math.trunc(this.textureModel.width / this.textureSquareSide);
        this.textureHeightSquareCount = Math.trunc(this.textureModel.height / this.textureSquareSide);

        this.textureXSquaresOffset = (this.textureModel.width
            - this.textureSquareSide * this.textureWidthSquareCount) / 2;
        this.textureYSquaresOffset = (this.textureModel.height
            - this.textureSquareSide * this.textureHeightSquareCount) / 2;
    }

    private initialiazeImageSquareInfo(): void {
        const squaresXOffset = this.textureXSquaresOffset
            * this.imageContainerModel.sideToTextureSideRatio;
        const squaresYOffset = this.textureYSquaresOffset
            * this.imageContainerModel.sideToTextureSideRatio;
    
        this.squaresContainerRectangle = new Rectangle(
            squaresXOffset,
            squaresYOffset,
            this.imageContainerModel.width - squaresXOffset * 2,
            this.imageContainerModel.height - squaresYOffset * 2,
        );
    
        this.squareSide = this.textureSquareSide * this.imageContainerModel.sideToTextureSideRatio;
    }

    public getImageSquareTexture(rowIndex: number, columnIndex: number): Texture | undefined {
        rowIndex = Math.floor(rowIndex);
        columnIndex = Math.floor(columnIndex);

        if (rowIndex < 0
            || rowIndex >= this.textureHeightSquareCount
            || columnIndex < 0
            || columnIndex >= this.textureWidthSquareCount) {
            return undefined;
        }

        const globalSquare = new Graphics()
            .rect(
                columnIndex * this.textureSquareSide + this.textureXSquaresOffset,
                rowIndex * this.textureSquareSide + this.textureYSquaresOffset,
                this.textureSquareSide,
                this.textureSquareSide
            )
            .fill({
                texture: this.textureModel.texture,
                textureSpace: "global"
            });

        const result = this.renderer.generateTexture(globalSquare);
        globalSquare.destroy();
        return result;
    }

    public getTileModel(rowIndex: number,
        columnIndex: number,
        shouldGetTexture: boolean = true): SquareTileModel {
        
        const result = new SquareTileModel();
        result.side = this.squareSide;
        result.boundingRectangle = new Rectangle(
            columnIndex * this.squareSide,
            rowIndex * this.squareSide,
            this.squareSide,
            this.squareSide
        );

        if (shouldGetTexture) {
            result.texture = this.getImageSquareTexture(rowIndex, columnIndex);
        }

        return result;
    }
}