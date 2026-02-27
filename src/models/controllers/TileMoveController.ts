import { Point } from "pixi.js";
import { OverTimePointChangeController }
    from "../../math/over-time-value-change-controllers/OverTimePointChangeController.ts";
import { TileController } from "./TileController.ts";

/**
 * Класс контроллера перемещения текущей позиции-точки фигуры
 */
export class TileMoveController extends TileController<Point> {
    /**
     * Подготовка к перемещению фигуры, установка параметров контроллера перемещения
     * @param positionPointDifference Координаты-разность,
     * на которые будет произведено перемещение
     */
    public prepareToExecute(positionPointDifference: Point): void {
        this.target.currentTargetPositionPoint = new Point(
            this.target.currentPositionPoint.x + positionPointDifference.x,
            this.target.currentPositionPoint.y + positionPointDifference.y
        );
        if (!this.controller) {            
            this.controller = new OverTimePointChangeController(
                this.target.currentPositionPoint,
                this.target.currentTargetPositionPoint,
                this.target.parameters.animationParameters.animationTime,
                this.target.parameters.animationParameters.accelerationTimeToAnimationTimeRatio
            );
        } else {
            this.controller.reset(this.target.currentPositionPoint,
                this.target.currentTargetPositionPoint);
        }
    }

    /**
     * Выполнение перемещения
     * @param deltaTime Интервал времени, прошедший с момента предыдущего перемещения
     */
    public execute(deltaTime: number): void {
        const positionPointIncrement: Point = this.controller?.getIsCompleted()
            ? new Point(0, 0)
            : (this.controller?.getIncrement(deltaTime) ?? new Point(0, 0));
        this.target.currentPositionPoint.x += positionPointIncrement.x;
        this.target.currentPositionPoint.y += positionPointIncrement.y;
    }

    /**
     * Операции по завершению перемещения
     */
    public complete(): void {
        this.target.currentPositionPoint = this.target.currentTargetPositionPoint.clone();
    }
}