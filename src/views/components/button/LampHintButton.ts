import { ContainerChild, ContainerOptions, Point } from "pixi.js";
import { CircleButton } from "./CircleButton.ts";
import { CircleButtonParameters } from "./CircleButtonParameters.ts";

/**
 * Кнопка показа подсказки-лампочки, когда подсвечивается фигура и её ячейка
 */
export class LampHintButton extends CircleButton {
    public static readonly wasActivatedEventName: string = "lampHintButtonWasActivatedEvent";
    public static readonly wasDeactivatedEventName: string = "lampHintButtonWasDeactivatedEvent";

    constructor (
        parameters: CircleButtonParameters,
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