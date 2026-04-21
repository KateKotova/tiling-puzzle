import { HintButton } from "./HintButton.ts";

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