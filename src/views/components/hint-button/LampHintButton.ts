import { ContainerChild, ContainerOptions, Point } from "pixi.js";
import { HintButton } from "./HintButton.ts";
import { HintButtonParameters } from "./HintButtonParameters.ts";

/**
 * Кнопка показа подсказки-лампочки, когда подсвечивается фигура и её ячейка
 */
export class LampHintButton extends HintButton {
    public static readonly wasActivatedEventName: string = "lampHintButtonWasActivatedEvent";
    public static readonly wasDeactivatedEventName: string = "lampHintButtonWasDeactivatedEvent";

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
            false,
            options
        );
    }

    public get wasActivatedEventName(): string {
        return LampHintButton.wasActivatedEventName;
    }

    public get wasDeactivatedEventName(): string {
        return LampHintButton.wasDeactivatedEventName;
    }
}