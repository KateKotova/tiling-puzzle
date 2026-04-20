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

/**
 * Класс контейнера панели управления,
 * которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export class TilingLevelControlContainer extends Container {
    private readonly parameters: TilingLevelControlParameters;
    private readonly size: Size;

    private readonly hintButtonIconSvgPath: string;
    private hintButton?: HintButton;

    private boundOnDraggingTileWasDeselected: () => void
        = this.onDraggingTileWasDeselected.bind(this);

    constructor(
        parameters: TilingLevelControlParameters,
        hintButtonIconSvgPath: string,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.hintButtonIconSvgPath = hintButtonIconSvgPath;
        this.size = new Size(options?.width ?? 0, options?.height ?? 0);
        this.initialize();
    }

    private initialize(): void {
        this.hintButton = this.createHintButton();
        if (!this.hintButton) {
            return;
        }
        this.addChild(this.hintButton);
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

    private createHintButton(): HintButton | undefined {
        const radius = this.parameters.hintButtonRadiusToControlContainerMinSideRatio
            * Math.min(this.size.width, this.size.height);
        const centerX = this.parameters.hintButtonCenterXToControlContainerWidthRatio
            * this.size.width;
        const centerY = this.parameters.hintButtonCenterYToControlContainerHeightRatio
            * this.size.height;

        return new HintButton(
            this.parameters.hintButtonParameters,
            radius,    
            this.hintButtonIconSvgPath,
            new Point(centerX, centerY)
        );
    }

    private onDraggingTileWasDeselected(): void {
        this.hintButton?.deactivate();
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        this.removeEventListeners();

        if (this.hintButton) {
            this.removeChild(this.hintButton);  
            this.hintButton.destroy();
        }

        super.destroy(options);
    }
}