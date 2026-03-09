import { Algorithm } from "../../math/Algorithm.ts";
import { SmoothNumberStepController }
    from "../../math/controllers/SmoothNumberStepController.ts";
import { TileController } from "./TileController.ts";

/**
 * Класс контроллера изменения текущего угла вращения фигуры вокруг точки опоры
 */
export class TileRotationController extends TileController<number> {
    /**
     * Подготовка к вращению фигуры, установка параметров контроллера вращения
     * @param rotationAngleDifference Угол-разность, на который будет произведён поворот.
     * Угол в радианах, может быть как положительным, так и отрицательным.
     */
    public prepareToExecute(rotationAngleDifference: number): void {
        this.target.currentTargetRotationAngle = this.target.currentRotationAngle
            + rotationAngleDifference;
        if (!this.controller) {            
            this.controller = new SmoothNumberStepController(
                this.target.currentRotationAngle,
                this.target.currentTargetRotationAngle,
                this.target.parameters.animationParameters.animationTime,
                this.target.parameters.animationParameters.accelerationTimeToAnimationTimeRatio
            );
        } else {
            this.controller.reset(this.target.currentRotationAngle,
                this.target.currentTargetRotationAngle);
        }
    }

    /**
     * Выполнение поворота
     * @param deltaTime Интервал времени, прошедший с момента предыдущего поворота
     */
    public execute(deltaTime: number): void {
        const rotationAngleIncrement: number = this.controller?.getIsCompleted()
            ? 0
            : (this.controller?.getIncrement(deltaTime) ?? 0);
        this.target.currentRotationAngle += rotationAngleIncrement;
    }

    /**
     * Операции по завершению вращения
     */
    public complete(): void {
        this.target.currentRotationAngle = Algorithm.getNormalizedAngle(
            this.target.currentTargetRotationAngle);
        this.target.currentTargetRotationAngle = this.target.currentRotationAngle;
    }
}