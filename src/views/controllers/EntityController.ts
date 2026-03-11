import { Ticker } from "pixi.js";

/**
 * Класс контроллера для сущности, величина которой меняется со временем
 */
export abstract class EntityController<EntityType, ValueType> {
    protected readonly target: EntityType;
    protected readonly ticker: Ticker;

    protected readonly tickerListener: () => void;
    private tickerListenerWasAdded: boolean = false;
    protected static tickerListenerCount: number = 0;

    constructor(target: EntityType, ticker: Ticker) {
        this.target = target;
        this.ticker = ticker;
        this.tickerListener = () => this.onTicker();
    }
    
    protected get staticTickerListenersCount(): number {
        return EntityController.tickerListenerCount;
    }

    protected set staticTickerListenersCount(value: number) {
        EntityController.tickerListenerCount = value;
    }

    protected removeTickerListener(): void {
        if (this.tickerListenerWasAdded) {
            this.ticker.remove(this.tickerListener);
            this.tickerListenerWasAdded = false;
            this.staticTickerListenersCount--;
            //this.logTickerListener();
        }
    }

    protected addTickerListener(): void {
        if (!this.tickerListenerWasAdded) {
            this.ticker.add(this.tickerListener);
            this.tickerListenerWasAdded = true;
            this.staticTickerListenersCount++;
            //this.logTickerListener();
        }
    }

    public logTickerListener() {
        console.log(`${this.constructor.name}: ${this.staticTickerListenersCount}`);
    }

    public abstract stop(): void;

    public abstract start(valueDifference: ValueType): void;

    protected abstract onTicker(): void;

    protected abstract prepareToExecute(valueDifference: ValueType): void;

    protected abstract execute(deltaTime: number): void;

    protected abstract complete(): void;

    public removeEventListeners(): void {
        this.removeTickerListener();
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}