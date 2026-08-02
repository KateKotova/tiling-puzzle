import { HintButton } from "./HintButton.ts";

/**
 * Кнопка показа подсказки-лампочки, когда подсвечивается фигура и её ячейка
 */
export class LampHintButton extends HintButton {
    public static readonly wasActivatedEventName: string = "lampHintButtonWasActivatedEvent";
    public static readonly wasDeactivatedEventName: string = "lampHintButtonWasDeactivatedEvent";

    public get wasActivatedEventName(): string {
        return LampHintButton.wasActivatedEventName;
    }

    public get wasDeactivatedEventName(): string {
        return LampHintButton.wasDeactivatedEventName;
    }
}