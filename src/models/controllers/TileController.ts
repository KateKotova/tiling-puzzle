import { TileModel } from "../tiles/TileModel.ts";
import { SmoothStepController } from "../../math/controllers/SmoothStepController.ts";

/**
 * Класс контроллера фигуры
 */
export abstract class TileController<ValueType> {
    protected target: TileModel;
    protected controller?: SmoothStepController<ValueType>;

    constructor(target: TileModel) {
        this.target = target;
    }

    public abstract prepareToExecute(valueDifference: ValueType): void;

    public abstract execute(deltaTime: number): void;

    public abstract complete(): void;

    public getIsCompleted(): boolean {
        return this.controller?.getIsCompleted() ?? false;
    }
}