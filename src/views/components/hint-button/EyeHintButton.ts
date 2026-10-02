import { ContainerChild, ContainerOptions, Point } from "pixi.js";
import { HintButton } from "./HintButton.ts";
import { HintButtonParameters } from "./HintButtonParameters.ts";

/**
 * Кнопка показа подсказки-глазика, когда ячейки становятся полупрозрачными
 */
export class EyeHintButton extends HintButton {
    public static readonly wasActivatedEventName: string = "eyeHintButtonWasActivatedEvent";
    public static readonly wasDeactivatedEventName: string = "eyeHintButtonWasDeactivatedEvent";

    constructor (
        parameters: HintButtonParameters,
        radius: number,
        iconSvgPath: string,
        centerPoint: Point,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(
            parameters,
            radius,
            iconSvgPath,
            centerPoint,
            true,
            options
        );
    }

    public get wasActivatedEventName(): string {
        return EyeHintButton.wasActivatedEventName;
    }

    public get wasDeactivatedEventName(): string {
        return EyeHintButton.wasDeactivatedEventName;
    }
}