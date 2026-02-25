import { Point } from "pixi.js";
import { TileGeometry } from "../tile-geometries/TileGeometry";
import { TilePosition } from "./TilePosition";
import { OverTimePointChangeController }
    from "../../math/over-time-value-changes/OverTimePointChangeController";
import { OverTimeNumberChangeController }
    from "../../math/over-time-value-changes/OverTimeNumberChangeController";
import { Algorithm } from "../../math/Algorithm";
import { TileParameters } from "./TileParameters";

/**
 * Класс элемента замощения.
 * Фигура имеет 2 вида положений: текущее (то, в котором она находится в данный момент)
 * и целевое (то, в котором она должна быть, когда мозаика собрана).
 */
export class TileModel {
    private static rotationAngleEpsilon: number = Math.PI / 180;
    private static positionCoordinateEpsilon: number = 2;

    private readonly parameters: TileParameters;
    public geometry: TileGeometry;
    /**
     * Целевая позиция элемента замощения в замощении
     */
    public targetTilePosition: TilePosition = new TilePosition();
    /**
     * Целевая позиция элемента замощения в замощении.
     * Это точка относительно родительского контейнера замощения.
     * Это точка, соответствующая положению локальной системы координат фигуры
     * (точки поворота (0; 0)) относительно системы координат родительского контейнера замощения.
     */
    public targetPositionPoint: Point = new Point(0, 0);

    /**
     * Текущая позиция-точка элемента замощения в замощении
     */
    public currentPositionPoint: Point = new Point(0, 0);
    /**
     * Текущая целевая позиция-точка элемента замощения в замощении.
     * Это точка, в которую стремится фигура в данный момент при перемещении,
     * например, на новую ячейку мозаики.
     */
    public currentTargetPositionPoint: Point = new Point(0, 0);
    /**
     * Контроллер перемещения текущей позиции-точки фигуры
     */
    private positionPointController?: OverTimePointChangeController;

    /**
     * Целевой угол вращения фигуры в радианах.
     * Это угол, на который должна быть повёрнута фигура в целевом положении
     * относительно положения геометрии фигуры по умолчанию.
     */
    public targetRotationAngle: number = 0;
    /**
     * Текущий угол вращения фигуры в радианах
     */
    public currentRotationAngle: number = 0;
    /**
     * Текущий целевой угол вращения фигуры в радианах.
     * Это угол, к которому стремится фигура в данный момент при повороте,
     * например, вокруг опорной точки.
     */
    public currentTargetRotationAngle: number = 0;
    /**
     * Контроллер изменения текущего угла вращения фигуры вокруг точки опоры
     */
    private rotationController?: OverTimeNumberChangeController;

    constructor(
        parameters: TileParameters,
        geometry: TileGeometry
    ) {
        this.parameters = parameters;
        this.geometry = geometry;
    }

    public clone(): TileModel {
        const result = new TileModel(this.parameters, this.geometry);

        result.targetTilePosition = this.targetTilePosition.clone();
        result.targetPositionPoint = this.targetPositionPoint.clone();

        result.currentPositionPoint = this.currentPositionPoint.clone();
        result.currentTargetPositionPoint = this.currentTargetPositionPoint.clone();

        result.targetRotationAngle = this.targetRotationAngle;
        result.currentRotationAngle = this.currentRotationAngle;
        result.currentTargetRotationAngle = this.currentTargetRotationAngle;

        return result;
    }

    /**
     * Получение признака того, что фигура находится в правильной позиции
     * и с правильным углом вращения, чтобы мозаика была собрана
     * @returns Верно ли расположен элемент замощения
     */
    public getIsLocatedCorrectly(): boolean {
        return Math.abs(this.targetPositionPoint.x - this.currentPositionPoint.x)
            <= TileModel.positionCoordinateEpsilon
            && Math.abs(this.targetPositionPoint.y - this.currentPositionPoint.y)
            <= TileModel.positionCoordinateEpsilon
            && Math.abs(this.targetRotationAngle - this.currentRotationAngle)
            <= TileModel.rotationAngleEpsilon;
    }

    /**
     * Элемент замощения имеет степень свободы, то есть число вращений вокруг оси,
     * которые он может совершить вокруг точки опоры так, чтобы оставаться в том же положении
     * и той же формы, но текстура при этом будет поворачиваться.
     * Ищется ближайший следующий угол, соответствующий степени свободы,
     * и до него как таз определяется эта разница.
     * Угол можно отложить как по часовой стрелке, так и против часовой,
     * то есть он может быть как положительным, так и отрицательным,
     * но разницу нужно взять именно такую, чтобы она была меньшей по модулю. 
     * @returns Угол разности в радианах, может быть как положительным, так и отрицательным,
     * в радианах
     */
    public getSamePositionNextAngleMinAngleDifference(): number {
        const normalizedCurrentRotationAngle = Algorithm.getNormalizedAngle(
            this.currentRotationAngle);
        // currentTargetRotationAngle вместо currentRotationAngle,
        // потому что предыдущее вращение может быть не закончено,
        // и уже начинается новое, поэтому freedomDegreeRotationAngle
        // нужно откладывать от целевого значения, а не от текущего,
        // иначе пазл может перекоситься.
        const normalizedNextRotationAngle = Algorithm.getNormalizedAngle(
            this.currentTargetRotationAngle + this.geometry.freedomDegreeRotationAngle);
        return Algorithm.getMinAngleDifference(normalizedCurrentRotationAngle,
            normalizedNextRotationAngle);
    }

    /**
     * Ищется минимальный по модулю угол поворота
     * до попадания элемента замощения в новую позицию в мозаике.
     * @param normalizedTargetRotationAngle Нормализованный текущий целевой угол в радианах
     * @returns Угол разности в радианах, может быть как положительным, так и отрицательным,
     * в радианах
     */
    public getNewPositionMinAngleDifference(normalizedTargetRotationAngle: number): number {
        if (this.geometry.freedomDegree == 1) {
            return Algorithm.getMinAngleDifference(this.currentRotationAngle,
                normalizedTargetRotationAngle);
        }

        let result = 2 * Math.PI;
        for (
            let freedomDegreeIndex = 1,
            potentialRotationAngle = normalizedTargetRotationAngle;
            freedomDegreeIndex <= this.geometry.freedomDegree;
            freedomDegreeIndex++,
            potentialRotationAngle += this.geometry.freedomDegreeRotationAngle
        ) {
            const normalizedPotentialRotationAngle = Algorithm
                .getNormalizedAngle(potentialRotationAngle);
            const potentialResult = Algorithm.getMinAngleDifference(
                this.currentRotationAngle, normalizedPotentialRotationAngle);
            if (Math.abs(result) - Math.abs(potentialResult) > TileModel.rotationAngleEpsilon) {
                result = potentialResult;
            }
        }
        return result;
    }

    /**
     * Подготовка к вращению фигуры, установка параметров контроллера вращения
     * @param rotationAngleDifference Угол-разность, на который будет произведён поворот.
     * Угол в радианах, может быть как положительным, так и отрицательным.
     */
    public prepareToRotation(rotationAngleDifference: number): void {
        this.currentTargetRotationAngle = this.currentRotationAngle + rotationAngleDifference;
        if (!this.rotationController) {            
            this.rotationController = new OverTimeNumberChangeController(
                this.currentRotationAngle,
                this.currentTargetRotationAngle,
                this.parameters.animationParameters.animationTime,
                this.parameters.animationParameters.accelerationTimeToAnimationTimeRatio
            );
        } else {
            this.rotationController.reset(this.currentRotationAngle,
                this.currentTargetRotationAngle);
        }
    }

    /**
     * Подготовка к перемещению фигуры, установка параметров контроллера перемещения
     * @param positionPointDifference Координаты-разность,
     * на которые будет произведено перемещение
     */
    public prepareToMove(positionPointDifference: Point): void {
        this.currentTargetPositionPoint = new Point(
            this.currentPositionPoint.x + positionPointDifference.x,
            this.currentPositionPoint.y + positionPointDifference.y
        );
        if (!this.positionPointController) {            
            this.positionPointController = new OverTimePointChangeController(
                this.currentPositionPoint,
                this.currentTargetPositionPoint,
                this.parameters.animationParameters.animationTime,
                this.parameters.animationParameters.accelerationTimeToAnimationTimeRatio
            );
        } else {
            this.positionPointController.reset(this.currentPositionPoint,
                this.currentTargetPositionPoint);
        }
    }

    /**
     * Выполнение поворота
     * @param deltaTime Интервал времени, прошедший с момента предыдущего поворота
     */
    public executeRotation(deltaTime: number): void {
        const rotationAngleIncrement: number = this.rotationController?.getIsCompleted()
            ? 0
            : (this.rotationController?.getIncrement(deltaTime) ?? 0);
        this.currentRotationAngle += rotationAngleIncrement;
    }

    /**
     * Выполнение перемещения
     * @param deltaTime Интервал времени, прошедший с момента предыдущего перемещения
     */
    public executeMove(deltaTime: number): void {
        const positionPointIncrement: Point = this.positionPointController?.getIsCompleted()
            ? new Point(0, 0)
            : (this.positionPointController?.getIncrement(deltaTime) ?? new Point(0, 0));
        this.currentPositionPoint.x += positionPointIncrement.x;
        this.currentPositionPoint.y += positionPointIncrement.y;
    }

    /**
     * Операции по завершению вращения
     */
    public completeRotation(): void {
        this.currentRotationAngle = Algorithm.getNormalizedAngle(
            this.currentTargetRotationAngle);
        this.currentTargetRotationAngle = this.currentRotationAngle;
    }

    /**
     * Операции по завершению перемещения
     */
    public completeMove(): void {
        this.currentPositionPoint = this.currentTargetPositionPoint.clone();
    }
    
    public getRotationIsCompleted(): boolean {
        return this.rotationController?.getIsCompleted() ?? false;
    }

    public getMoveIsCompleted(): boolean {
        return this.positionPointController?.getIsCompleted() ?? false;
    }
}