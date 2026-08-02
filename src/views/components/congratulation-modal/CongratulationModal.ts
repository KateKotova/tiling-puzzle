import { BitmapText, Container, ContainerChild, ContainerOptions, Graphics, Ticker } from "pixi.js";
import { CongratulationModalParameters } from "./CongratulationModalParameters.ts";
import { ContainerAlphaController } from "../../controllers/ContainerAlphaController.ts";

/**
 * Кнопка показа подсказки
 */
export class CongratulationModal extends Container {
    /**
     * Опорная точка текста переносится в его центр.
     * Для абсциссы это работает как половина ширины.
     * Но для ординаты половина высоты почему-то не работает.
     * Этот коэффициент подобран так, чтобы опорная точка
     * приблизительно визуально была по вертикали центру.
     */
    public static readonly textVisualCenterYMultiplier = 0.75;

    private readonly parameters: CongratulationModalParameters;
    private modalWidth: number = 0;
    private modalHeight: number = 0;
    private modalPadding: number = 0;
    private text?: BitmapText;
    private readonly overlay: Graphics;
    private readonly modal: Graphics;

    public readonly alphaController: ContainerAlphaController;

    constructor (
        parameters: CongratulationModalParameters,
        screenWidth: number,
        screenHeight: number,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);       
        this.parameters = parameters;

        this.alpha = 0;
        this.alphaController = new ContainerAlphaController(
            this.parameters.animationParameters,
            this,
            ticker
        );

        this.createTextAndSetSizes(screenWidth, screenHeight);

        this.overlay = this.createOverlay(screenWidth, screenHeight);
        this.addChild(this.overlay);

        this.modal = this.createModal(screenWidth, screenHeight);
        this.addChild(this.modal);

        if (this.text) {
            this.addChild(this.text);
        }
    }

    private createTextAndSetSizes(screenWidth: number, screenHeight: number): void {
        const modalMaxWidth = screenWidth * this.parameters.maxWidthToScreenWidthRatio;
        const modalMaxHeight = screenHeight * this.parameters.maxHeightToScreenHeightRatio;

        const testFontSize = modalMaxHeight;
        this.text = this.createText(testFontSize);

        const textTestMinSide = Math.min(this.text.width, this.text.height);
        const modalTestPadding = textTestMinSide * this.parameters.paddingToMinSideRatio;
        const doubleModalTestPadding = modalTestPadding * 2;

        const modalTestWidth = this.text.width + doubleModalTestPadding;
        const modalTestHeight = this.text.height + doubleModalTestPadding;
        const modalTestWidthToTestHeightRatio = modalTestWidth / modalTestHeight;

        this.modalWidth = modalMaxWidth;
        this.modalHeight = this.modalWidth / modalTestWidthToTestHeightRatio;

        if (this.modalHeight > modalMaxHeight) {
            this.modalHeight = modalMaxHeight;
            this.modalWidth = this.modalHeight * modalTestWidthToTestHeightRatio;
        }

        const modalSizeToTestSize = this.modalWidth / modalTestWidth;
        this.modalPadding = modalTestPadding * modalSizeToTestSize;
        this.text.scale.set(modalSizeToTestSize);

        const textBounds = this.text.getLocalBounds();
        this.text.pivot.set(
            textBounds.x + textBounds.width / 2.0,
            textBounds.y + textBounds.height
                * CongratulationModal.textVisualCenterYMultiplier,
        );
        this.text.position.set(screenWidth / 2.0, screenHeight / 2.0);
    }

    private createText(fontSize: number): BitmapText {
        return new BitmapText({
            text: this.parameters.text,
            style: {
                fontFamily: this.parameters.fontFamily,
                fontSize: fontSize,
                fill: this.parameters.textColor,
            }
        });
    }

    private createOverlay(screenWidth: number, screenHeight: number): Graphics {
        const result = new Graphics()
            .rect(0, 0, screenWidth, screenHeight)
            .fill({
                color: this.parameters.overlayColor,
                alpha: this.parameters.overlayAlpha
            });
        result.cacheAsTexture({ antialias: true });
        result.eventMode = "static";
        return result;
    }

    private createModal(screenWidth: number, screenHeight: number): Graphics {
        const result = new Graphics()
            .roundRect(0, 0, this.modalWidth, this.modalHeight, this.modalPadding)
            .fill({ color: this.parameters.fillColor })
            .stroke({
                width: this.parameters.strokeWidth,
                color: this.parameters.strokeColor
            });
        result.pivot.set(result.width / 2.0, result.height / 2.0);
        result.position.set(screenWidth / 2.0, screenHeight / 2.0);
        result.cacheAsTexture({ antialias: true });
        return result;
    }

    public hide(): void {
        this.alphaController.restart(this.alpha, 0);
    }

    public show(): void {
        this.alphaController.restart(this.alpha, 1);
    }
}