import { TileModel } from "../tiles/TileModel.ts";
import { OverTimeValueChangeController } from "../../math/over-time-value-change-controllers/OverTimeValueChangeController.ts";

/**
 * Класс контроллера фигуры
 */
export abstract class TileController<TValue> {
    protected target: TileModel;
    protected controller?: OverTimeValueChangeController<TValue>;

    constructor(target: TileModel) {
        this.target = target;
    }

    public abstract prepareToExecute(valueDifference: TValue): void;

    public abstract execute(deltaTime: number): void;

    public abstract complete(): void;

    public getIsCompleted(): boolean {
        return this.controller?.getIsCompleted() ?? false;
    }
}