import { TileLineContainer } from "../components/TileLineContainer.ts";
import { SmoothNumberStepController }
    from "../../math/controllers/SmoothNumberStepController.ts";
import { EntityController } from "./EntityController.ts";

/**
 * Класс контроллера для линии пазлов, размер которой меняется со временем
 */
export class TileLineResizeController
    extends EntityController<TileLineContainer, number> {
    private controller?: SmoothNumberStepController;

    protected get staticTickerListenersCount(): number {
        return TileLineResizeController.onTickerCount;
    }

    protected set staticTickerListenersCount(value: number) {
        TileLineResizeController.onTickerCount = value;
    }

    public stop(): void {
        this.removeTickerListener();
        this.target.isResizing = false;
    }

    public start(longitudinalSizeDifference: number): void {
        this.removeTickerListener();
        this.target.isResizing = true;
        this.target.dispatchStartResizeEvent();
        this.prepareToExecute(longitudinalSizeDifference);        
        this.addTickerListener();
    }

    protected onTicker(): void {
        this.execute(this.ticker.deltaMS);
        if (this.controller?.getIsCompleted()) {
            this.complete();
            this.removeTickerListener();
            this.target.dispatchStopResizeEvent();
        }        
    }

    protected prepareToExecute(longitudinalSizeDifference: number): void {
        this.target.targetLongitudinalSize = this.target.longitudinalSize
            + longitudinalSizeDifference;

        if (!this.controller) {            
            this.controller = new SmoothNumberStepController(
                this.target.longitudinalSize,
                this.target.targetLongitudinalSize,
                this.target.parameters.animationParameters.animationTime,
                this.target.parameters.animationParameters
                    .accelerationTimeToAnimationTimeRatio
            );
        } else {
            this.controller.reset(this.target.longitudinalSize,
                this.target.targetLongitudinalSize);
        }
    }

    protected execute(deltaTime: number): void {
        const sizeIncrement = this.controller?.getIsCompleted()
            ? 0
            : (this.controller?.getIncrement(deltaTime) ?? 0);
        this.target.resizeWithoutAnimation(this.target.longitudinalSize + sizeIncrement);
    }

    protected complete(): void {
        this.target.resizeWithoutAnimation(this.target.targetLongitudinalSize);
        if (!this.target.tileViews.length) {
            this.target.backgroundContainer.visible = false;
        }
        this.target.isResizing = false;
    }
}