import { HintButton } from "./HintButton.ts";

/**
 * Кнопка показа подсказки-глазика, когда ячейки становятся полупрозрачными
 */
export class EyeHintButton extends HintButton {
    public static readonly wasActivatedEventName: string = "eyeHintButtonWasActivatedEvent";
    public static readonly wasDeactivatedEventName: string = "eyeHintButtonWasDeactivatedEvent";

    public get wasActivatedEventName(): string {
        return EyeHintButton.wasActivatedEventName;
    }

    public get wasDeactivatedEventName(): string {
        return EyeHintButton.wasDeactivatedEventName;
    }
}