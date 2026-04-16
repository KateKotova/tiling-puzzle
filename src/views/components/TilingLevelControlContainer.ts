import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Point,
    Renderer
} from "pixi.js";
import { HintButton } from "./HintButton.ts";
import { TilingLevelControlParameters } from "./TilingLevelControlParameters.ts";

/**
 * Класс контейнера панели управления,
 * которая должна находиться в вертикальном контейнере уровня мозаичного замощения
 */
export class TilingLevelControlContainer extends Container {
    private readonly parameters: TilingLevelControlParameters;
    private readonly renderer: Renderer;

    private readonly hintButtonIconSvgPath: string;
    private hintButton?: HintButton;

    constructor(
        parameters: TilingLevelControlParameters,
        renderer: Renderer,
        hintButtonIconSvgPath: string,        
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.parameters = parameters;
        this.hintButtonIconSvgPath = hintButtonIconSvgPath;
        this.renderer = renderer;
        this.initialize();
    }

    private initialize(): void {
        this.hintButton = this.createHintButton();
        if (!this.hintButton) {
            return;
        }
        this.addChild(this.hintButton);
    }

    private createHintButton(): HintButton | undefined {
        const radius = this.parameters.hintButtonRadiusToControlContainerHeightRatio
            * this.height;
        const centerX = this.parameters.hintButtonCenterXToControlContainerWidthRatio
            * this.width;
        const centerY = this.parameters.hintButtonCenterYToControlContainerHeightRatio
            * this.height;

        return new HintButton(
            this.parameters.hintButtonParameters,
            this.renderer,
            radius,    
            this.hintButtonIconSvgPath,
            new Point(centerX, centerY)
        );
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }

        if (this.hintButton) {
            this.removeChild(this.hintButton);  
            this.hintButton.destroy();
        }

        super.destroy(options);
    }
}