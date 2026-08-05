import { Container, Ticker } from "pixi.js";
import { SmoothNumberStepController }
    from "../../math/controllers/SmoothNumberStepController.ts";
import { AnimationParameters } from "../../AnimationParameters.ts";

/**
 * Класс контроллера для контейнера,
 * прозрачность которого меняется со временем
 */
export class ContainerAlphaController {
    private readonly parameters: AnimationParameters;
    private readonly container: Container;
    private readonly ticker: Ticker;
    private controller?: SmoothNumberStepController;

    private readonly boundOnTicker: () => void = this.onTicker.bind(this);
    private onTickerWasAdded: boolean = false;
    private static onTickerCount: number = 0;

    constructor(
        parameters: AnimationParameters,
        container: Container,
        ticker: Ticker
    ) {
        this.parameters = parameters;
        this.container = container;
        this.ticker = ticker;
    }

    private removeTickerListener(): void {
        if (this.onTickerWasAdded) {
            this.ticker.remove(this.boundOnTicker);
            this.onTickerWasAdded = false;
            ContainerAlphaController.onTickerCount--;
            //this.logTicker();
        }
    }

    private addTickerListener(): void {
        if (!this.onTickerWasAdded) {
            this.ticker.add(this.boundOnTicker);
            this.onTickerWasAdded = true;
            ContainerAlphaController.onTickerCount++;
            //this.logTicker();
        }
    }

    public logTicker() {
        console.log(`${this.constructor.name}: ${ContainerAlphaController.onTickerCount}`);
    }

    public restart(newStartValue: number, newTargetValue: number): void {
        this.stop();
        this.prepareToExecute(newStartValue, newTargetValue);  
        this.start();
    }

    private stop(): void {
        this.removeTickerListener();
        this.updateAllCacheTextures(this.container, true);
    }

    private start(): void {
        this.removeTickerListener();
        this.addTickerListener();
        this.updateAllCacheTextures(this.container, false);
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
            this.container.alpha += valueIncrement;
        }
    }

    private complete(): void {
        if (!this.controller) {
            return;
        }

        this.controller.complete();
        
        const targetValue = this.controller.targetValue;
        this.container.alpha = targetValue;

        this.updateAllCacheTextures(this.container, true);
    }

    public removeEventListeners(): void {
        this.removeTickerListener();
    }

    public destroy(): void {
        this.removeEventListeners();
    }

    private updateAllCacheTextures(container: Container, shouldCacheTextures: boolean) {
        for (const child of container.children) {
            if (child.children?.length > 0) {
                this.updateAllCacheTextures(child, shouldCacheTextures);
            }
            
            if (typeof child.cacheAsTexture === 'function') {
                child.cacheAsTexture(shouldCacheTextures ? { antialias: true } : false);
            }
        }
    }
}