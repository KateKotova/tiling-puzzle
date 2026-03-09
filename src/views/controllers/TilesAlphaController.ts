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

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(
        parameters: AnimationParameters,
        tileViews: TileView[],
        ticker: Ticker
    ) {
        this.parameters = parameters;
        this.tileViews = tileViews;
        this.ticker = ticker;
    }

    public restart(newStartValue: number, newTargetValue: number): void {
        this.stop();
        this.prepareToExecute(newStartValue, newTargetValue);  
        this.start();
    }

    private stop(): void {
        if (!this.controller?.getIsCompleted()) {
            this.ticker.remove(this.boundOnTicker);
        }
    }

    private start(): void {
        this.ticker.add(this.boundOnTicker);
    }

    private onTicker(ticker: Ticker): void {
        this.execute(ticker.deltaMS);
        if (this.controller?.getIsCompleted()) {
            this.complete();
            this.ticker.remove(this.boundOnTicker);
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
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}