import { Ticker } from "pixi.js";

/**
 * Класс контроллера для сущности, величина которой меняется со временем
 */
export abstract class EntityController<EntityType, ValueType> {
    protected readonly target: EntityType;
    protected readonly ticker: Ticker;

    protected readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);

    constructor(target: EntityType, ticker: Ticker) {
        this.target = target;
        this.ticker = ticker;
    }

    public abstract stop(): void;

    public abstract start(valueDifference: ValueType): void;

    protected abstract onTicker(ticker: Ticker): void;

    protected abstract prepareToExecute(valueDifference: ValueType): void;

    protected abstract execute(deltaTime: number): void;

    protected abstract complete(): void;

    public removeEventListeners(): void {
        this.ticker.remove(this.boundOnTicker);
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}