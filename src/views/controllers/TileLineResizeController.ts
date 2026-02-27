import { Ticker } from "pixi.js";
import { TileLineContainer } from "../components/TileLineContainer.ts";
import { OverTimeNumberChangeController }
    from "../../math/over-time-value-change-controllers/OverTimeNumberChangeController.ts";
import { EntityController } from "./EntityController.ts";

/**
 * Класс контроллера для линии пазлов, размер которой меняется со временем
 */
export class TileLineResizeController
    extends EntityController<TileLineContainer, number> {
    /**
     * Контроллер изменения размера ленты
     */
    private controller?: OverTimeNumberChangeController;

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

    protected onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.controller?.getIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
            // TODO: это будет, когда линия будет перетаскиваться
            //this.target.setOnPointerDownActivity(true);
        }        
    }

    protected prepareToExecute(longitudinalSizeDifference: number): void {
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