import { Ticker } from "pixi.js";
import { SmoothNumberStepController }
    from "../../math/controllers/SmoothNumberStepController.ts";
import { AnimationParameters } from "../../AnimationParameters.ts";
import { TileView } from "../tiles/TileView.ts";

/**
 * Класс контроллера для перетаскиваемого элемента замощения,
 * угол поворота вокруг опорной точки которого меняется со временем
 */
export class TilesAlphaController {
    private readonly parameters: AnimationParameters;
    private readonly tileViews: TileView[];
    private readonly ticker: Ticker;
    private controller?: SmoothNumberStepController;

    private readonly tickerListener: () => void;
    private tickerListenerWasAdded: boolean = false;
    private static tickerListenerCount: number = 0;

    constructor(
        parameters: AnimationParameters,
        tileViews: TileView[],
        ticker: Ticker
    ) {
        this.parameters = parameters;
        this.tileViews = tileViews;
        this.ticker = ticker;
        this.tickerListener = () => this.onTicker();
    }

    private removeTickerListener(): void {
        if (this.tickerListenerWasAdded) {
            this.ticker.remove(this.tickerListener);
            this.tickerListenerWasAdded = false;
            TilesAlphaController.tickerListenerCount--;
            //this.logTickerListener();
        }
    }

    private addTickerListener(): void {
        if (!this.tickerListenerWasAdded) {
            this.ticker.add(this.tickerListener);
            this.tickerListenerWasAdded = true;
            TilesAlphaController.tickerListenerCount++;
            //this.logTickerListener();
        }
    }

    public logTickerListener() {
        console.log(`${this.constructor.name}: ${TilesAlphaController.tickerListenerCount}`);
    }

    public restart(newStartValue: number, newTargetValue: number): void {
        this.stop();
        this.prepareToExecute(newStartValue, newTargetValue);  
        this.start();
    }

    private stop(): void {
        this.removeTickerListener();
    }

    private start(): void {
        this.removeTickerListener();
        this.addTickerListener();
    }

    private onTicker(): void {
        this.execute(this.ticker.deltaMS);
        if (this.controller?.getIsCompleted()) {
            this.complete();
            this.removeTickerListener();
        }        
    }

    private prepareToExecute(startValue: number, targetValue: number): void {
        if (!this.controller) {            
            this.controller = new SmoothNumberStepController(
                startValue,
                targetValue,
                this.parameters.animationTime,
                this.parameters.accelerationTimeToAnimationTimeRatio
            );
        } else {
            this.controller.reset(startValue, targetValue);
        }
    }

    private execute(deltaTime: number): void {
        const valueIncrement: number = this.controller?.getIsCompleted()
            ? 0
            : (this.controller?.getIncrement(deltaTime) ?? 0);
        
        if (valueIncrement !== 0) {
            this.tileViews.forEach(tileView => {
                tileView.tile.alpha += valueIncrement;
                tileView.tile.updateCacheTexture();
            });
        }
    }

    private complete(): void {
        if (!this.controller) {
            return;
        }

        this.controller.complete();
        
        const targetValue = this.controller.targetValue;
        this.tileViews.forEach(tileView => {
            tileView.tile.alpha = targetValue;
            tileView.tile.updateCacheTexture();
        });
    }

    public removeEventListeners(): void {
        this.removeTickerListener();
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}