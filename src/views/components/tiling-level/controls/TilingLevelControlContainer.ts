import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Point
} from "pixi.js";
import { HintButton } from "../../hint-button/HintButton.ts";
import { TilingLevelControlParameters } from "./TilingLevelControlParameters.ts";
import { Size } from "../../../../math/Size.ts";
import { DraggableTileView } from "../../../tile-decorators/DraggableTileView.ts";
import { EyeHintButton } from "../../hint-button/EyeHintButton.ts";
import { LampHintButton } from "../../hint-button/LampHintButton.ts";

/**
 * Класс контейнера панели управления,
 * которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export class TilingLevelControlContainer extends Container {
    private readonly parameters: TilingLevelControlParameters;
    private readonly size: Size;

    private readonly eyeHintButtonIconSvgPath: string;
    private readonly lampHintButtonIconSvgPath: string;
    private readonly hintButtonRadius: number;
    private readonly hintButtonCenterY: number;
    private eyeHintButton?: HintButton;
    private lampHintButton?: HintButton;

    private boundOnDraggingTileWasDeselected: () => void
        = this.onDraggingTileWasDeselected.bind(this);

    constructor(
        parameters: TilingLevelControlParameters,
        eyeHintButtonIconSvgPath: string,
        lampHintButtonIconSvgPath: string,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.eyeHintButtonIconSvgPath = eyeHintButtonIconSvgPath;
        this.lampHintButtonIconSvgPath = lampHintButtonIconSvgPath;
        this.size = new Size(options?.width ?? 0, options?.height ?? 0);
        this.hintButtonRadius = this.parameters.hintButtonRadiusToControlContainerMinSideRatio
            * Math.min(this.size.width, this.size.height);
        this.hintButtonCenterY = this.parameters.hintButtonCenterYToControlContainerHeightRatio
            * this.size.height;
        this.initialize();
    }

    private initialize(): void {
        this.eyeHintButton = this.createEyeHintButton();
        if (!this.eyeHintButton) {
            return;
        }
        this.addChild(this.eyeHintButton);

        this.lampHintButton = this.createLampHintButton();
        if (!this.lampHintButton) {
            return;
        }
        this.addChild(this.lampHintButton);

        this.addEventListeners();
    }

    private addEventListeners(): void {
        window.addEventListener(DraggableTileView.draggingTileWasDeselectedEventName,
            this.boundOnDraggingTileWasDeselected);
    }

    private removeEventListeners(): void {
        window.removeEventListener(DraggableTileView.draggingTileWasDeselectedEventName,
            this.boundOnDraggingTileWasDeselected);
    }

    private createEyeHintButton(): HintButton | undefined {
        const centerX = this.parameters.eyeHintButtonCenterXToControlContainerWidthRatio
            * this.size.width;

        return new EyeHintButton(
            this.parameters.hintButtonParameters,
            this.hintButtonRadius,    
            this.eyeHintButtonIconSvgPath,
            new Point(centerX, this.hintButtonCenterY)
        );
    }

    private createLampHintButton(): HintButton | undefined {
        const centerX = this.parameters.lampHintButtonCenterXToControlContainerWidthRatio
            * this.size.width;

        return new LampHintButton(
            this.parameters.hintButtonParameters,
            this.hintButtonRadius,    
            this.lampHintButtonIconSvgPath,
            new Point(centerX, this.hintButtonCenterY)
        );
    }

    private onDraggingTileWasDeselected(): void {
        this.eyeHintButton?.deactivate();
        this.lampHintButton?.deactivate();
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        this.removeEventListeners();

        if (this.lampHintButton) {
            this.removeChild(this.lampHintButton);  
            this.lampHintButton.destroy();
        }

        if (this.eyeHintButton) {
            this.removeChild(this.eyeHintButton);  
            this.eyeHintButton.destroy();
        }

        super.destroy(options);
    }
}