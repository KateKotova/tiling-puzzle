import { Ticker } from "pixi.js";
import { TileLineContainer } from "../views/components/TileLineContainer.ts";
import { OverTimeNumberChangeController }
    from "../math/over-time-value-change-controllers/OverTimeNumberChangeController.ts";

export class TileLineResizeController {
    private readonly target: TileLineContainer;
    private readonly ticker: Ticker;
    /**
     * Контроллер изменения размера ленты
     */
    private controller?: OverTimeNumberChangeController;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(target: TileLineContainer, ticker: Ticker) {
        this.target = target;
        this.ticker = ticker;
    }

    public stop(): void {
        if (!this.controller?.getIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
            this.target.isResizing = false;
        }
    }

    public start(longitudinalSizeDifference: number): void {
        this.target.isResizing = true;
        // TODO: это будет, когда линия будет перетаскиваться
        //this.target.setOnPointerDownActivity(false);
        this.prepareToExecute(longitudinalSizeDifference);        
        this.ticker.add(this.boundOnTicker);
    }

    private onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.controller?.getIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            // TODO: это будет, когда линия будет перетаскиваться
            //this.target.setOnPointerDownActivity(true);
        }        
    }

    private prepareToExecute(longitudinalSizeDifference: number): void {
        this.target.targetLongitudinalSize = this.target.longitudinalSize
            + longitudinalSizeDifference;

        if (!this.controller) {            
            this.controller = new OverTimeNumberChangeController(
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

    private execute(deltaTime: number): void {
        const sizeIncrement = this.controller?.getIsCompleted()
            ? 0
            : (this.controller?.getIncrement(deltaTime) ?? 0);
        this.target.resizeWithoutAnimation(this.target.longitudinalSize + sizeIncrement);
    }

    private complete(): void {
        this.target.resizeWithoutAnimation(this.target.targetLongitudinalSize);
        if (!this.target.tileViews.length) {
            this.target.backgroundContainer.visible = false;
        }
        this.target.isResizing = false;
    }

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}