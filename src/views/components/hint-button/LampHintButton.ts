import { HintButton } from "./HintButton.ts";

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