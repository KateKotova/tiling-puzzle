/**
 * Singleton-класс контроллера колёсика мыши
 */
export class WheelController {
    private static instance: WheelController;
    private scrollOnWheelIsActive: boolean = true;

    private boundPreventScrollOnWheel: (event: WheelEvent) => void
        = this.preventScrollOnWheel.bind(this);

    private constructor() {
    }

    public static getInstance(): WheelController {
        if (!WheelController.instance) {
            WheelController.instance = new WheelController();
        }
        return WheelController.instance;
    }

    public setScrollOnWheelActivity(isActive: boolean): void {
        if ((isActive && this.scrollOnWheelIsActive)
            || (!isActive && !this.scrollOnWheelIsActive)) {
            return;
        }
        this.scrollOnWheelIsActive = isActive;
        if (isActive) {
            window.removeEventListener('wheel', this.boundPreventScrollOnWheel);
        } else {
            window.addEventListener('wheel', this.boundPreventScrollOnWheel, { passive: false });
        }
    }

    private preventScrollOnWheel(event: WheelEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    public removeEventListeners(): void {
        window.removeEventListener('wheel', this.boundPreventScrollOnWheel);   
    }
}