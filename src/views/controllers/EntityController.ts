import { Ticker } from "pixi.js";

/**
 * Класс контроллера для сущности, величина которой меняется со временем
 */
export abstract class EntityController<EntityType, ValueType> {
    protected readonly target: EntityType;
    protected readonly ticker: Ticker;

    protected readonly boundOnTicker: () => void = this.onTicker.bind(this);
    private onTickerWasAdded: boolean = false;
    protected static onTickerCount: number = 0;

    constructor(target: EntityType, ticker: Ticker) {
        this.target = target;
        this.ticker = ticker;
    }
    
    protected get staticTickerListenersCount(): number {
        return EntityController.onTickerCount;
    }

    protected set staticTickerListenersCount(value: number) {
        EntityController.onTickerCount = value;
    }

    protected removeTickerListener(): void {
        if (this.onTickerWasAdded) {
            this.ticker.remove(this.boundOnTicker);
            this.onTickerWasAdded = false;
            this.staticTickerListenersCount--;
            //this.logTicker();
        }
    }

    protected addTickerListener(): void {
        if (!this.onTickerWasAdded) {
            this.ticker.add(this.boundOnTicker);
            this.onTickerWasAdded = true;
            this.staticTickerListenersCount++;
            //this.logTicker();
        }
    }

    public logTicker() {
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