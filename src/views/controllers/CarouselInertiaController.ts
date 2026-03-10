import { Ticker } from "pixi.js";
import { CarouselContainer } from "../components/CarouselContainer.ts";
import { AverageValueController } from "../../math/controllers/AverageValueController.ts";
import { DeceleratedMotionController } from "../../math/controllers/DeceleratedMotionController.ts";
import { InertiaController } from "../../math/controllers/InertiaController.ts";
import { AverageValueParameters } from "../../math/controllers/AverageValueParameters.ts";
import { DeceleratedMotionParameters } from "../../math/controllers/DeceleratedMotionParameters.ts";

/**
 * Класс, контролирующий равнозамедленное движение карусели после отпускания указателя
 */
export class CarouselInertiaController {
    private static readonly inertiaIncrementEpsilon = 0.01;    
    private readonly target: CarouselContainer;
    private readonly ticker: Ticker;
    private readonly velocityMultiplier: number;
    private readonly velocityController: AverageValueController;
    private readonly deceleratedMotionController: DeceleratedMotionController;
    private inertiaController?: InertiaController;

    private readonly tickerListener: () => void;
    private tickerListenerWasAdded: boolean = false;

    constructor(
        target: CarouselContainer,
        ticker: Ticker,
        velocityParameters: AverageValueParameters,
        velocityMultiplier: number,
        deceleratedMotionParameters: DeceleratedMotionParameters
    ) {
        this.target = target;
        this.ticker = ticker;
        this.velocityMultiplier = velocityMultiplier;

        this.velocityController = new AverageValueController({
            minValue: velocityParameters.minValue,
            maxValue: velocityParameters.maxValue,
            maxValueCount: velocityParameters.maxValueCount,
            extremeZoneMaxValueMultiplier: velocityParameters.extremeZoneMaxValueMultiplier
        });

        this.deceleratedMotionController = new DeceleratedMotionController({
            absoluteAcceleration: deceleratedMotionParameters.absoluteAcceleration,
            minMotionTime: deceleratedMotionParameters.minMotionTime,
            minMotionToBoundTime: deceleratedMotionParameters.minMotionToBoundTime
        });

        this.tickerListener = () => this.onTicker();
    }

    private removeTickerListener(): void {
        if (this.tickerListenerWasAdded) {
            this.ticker.remove(this.tickerListener);
            this.tickerListenerWasAdded = false;
        }
    }

    private addTickerListener(): void {
        if (!this.tickerListenerWasAdded) {
            this.ticker.add(this.tickerListener);
            this.tickerListenerWasAdded = true;
        }
    }

    public restart(): void {
        this.stop();
        const velocity = this.velocityController.getAverageValue() * this.velocityMultiplier;        
        this.start(velocity);
    }

    public stop(): void {
        this.target.isMoving = false;
        this.inertiaController = undefined;
        this.removeTickerListener();
    }

    private start(velocity: number): void {
        if (
            !this.target.getCanScroll()
            || Math.abs(velocity) < this.velocityController.getMinValue()
        ) {
            return;
        }

        this.removeTickerListener();
        
        const currentCoordinate = this.target.getCoordinate();
        
        const deceleratedMotionResult = this.deceleratedMotionController.getResult(
            velocity,
            currentCoordinate,
            this.target.getMinCoordinate(),
            this.target.getMaxCoordinate()
        );
        
        this.inertiaController = new InertiaController(
            currentCoordinate,
            velocity,
            deceleratedMotionResult.acceleration,
            deceleratedMotionResult.time
        );
        
        this.target.isMoving = true;
        this.addTickerListener();
    }

    private onTicker(): void {
        if (!this.target.isMoving || !this.inertiaController) {
            this.stop();
            return;
        }
        
        const deltaTime = this.ticker.deltaMS;
        const increment = this.inertiaController.getIncrement(deltaTime);
        
        // Если изменение очень маленькое, устанавливаем целевую координату
        if (Math.abs(increment) < CarouselInertiaController.inertiaIncrementEpsilon) {
            if (this.inertiaController.getIsCompleted()) {
                this.target.setCurrentCoordinate(this.inertiaController.targetValue);
            }
            this.stop();
            return;
        }
        
        const currentCoordinate = this.target.getCoordinate();
        this.target.setCurrentCoordinate(currentCoordinate + increment);
        
        if (this.inertiaController.getIsCompleted()) {
            this.target.setCurrentCoordinate(this.inertiaController.targetValue);
            this.stop();
        }
    }

    public resetVelocity(): void {
        this.velocityController.clearValues();
        this.velocityController.addValue(0);
    }

    public addVelocity(velocity: number): void {
        this.velocityController.addValue(velocity);
    }

    public clearVelocities(): void {
        this.velocityController.clearValues();
    }

    public removeEventListeners(): void {
        this.removeTickerListener();
    }

    public destroy(): void {
        this.removeEventListeners();
    }
}