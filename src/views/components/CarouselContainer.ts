import {
    Color,
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    FederatedPointerEvent,
    Graphics,
    Ticker
} from 'pixi.js';
import { CarouselDirectionType } from './CarouselDirectionType.ts';
import { AverageValueController } from '../../math/controllers/AverageValueController.ts';
import { InertiaController } from '../../math/controllers/InertiaController.ts';
import { DeceleratedMotionController }
    from '../../math/controllers/DeceleratedMotionController.ts';
import { CarouselParameters } from './CarouselParameters.ts';
import { ViewportContainer } from './ViewportContainer.ts';

/**
 * Класс карусели с инерционной прокруткой
 */
export class CarouselContainer extends ViewportContainer {
    private static readonly inertiaIncrementEpsilon = 0.01;
    private readonly parameters: CarouselParameters;
    private readonly velocityController: AverageValueController;
    private readonly deceleratedMotionController: DeceleratedMotionController;
    private inertiaController?: InertiaController;

    private backgroundContainer: Container;
    private backgroundFillColor: Color = new Color(0x007700);
    
    private isDragging: boolean = false;
    private isMoving: boolean = false;
    private dragStartCoordinate: number = 0;
    private dragStartTime: number = 0;
    private lastPointerCoordinate: number = 0;

    private pointerId?: number;
    private isPointerDown: boolean = false;
    private onPointerDownIsActive: boolean = true;

    private readonly ticker: Ticker;

    private readonly boundOnTicker: (ticker: Ticker) => void = this.onTicker.bind(this);
    
    public getShouldPreventEvents: () => boolean = () => false;
    public onDestroy?: () => void;
    
    constructor(
        parameters: CarouselParameters,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);

        this.parameters = parameters;
        this.ticker = ticker;
        this.backgroundContainer = this.createBackground();
        
        const velocityParameters = parameters.velocityParameters;
        this.velocityController = new AverageValueController({
            minValue: velocityParameters.minValue,
            maxValue: velocityParameters.maxValue,
            maxValueCount: velocityParameters.maxValueCount,
            extremeZoneMaxValueMultiplier: velocityParameters.extremeZoneMaxValueMultiplier
        });
        
        const deceleratedMotionParameters = parameters.deceleratedMotionParameters;
        this.deceleratedMotionController = new DeceleratedMotionController({
            absoluteAcceleration: deceleratedMotionParameters.absoluteAcceleration,
            minMotionTime: deceleratedMotionParameters.minMotionTime,
            minMotionToBoundTime: deceleratedMotionParameters.minMotionToBoundTime
        });
        
        this.eventMode = 'static';
        this.interactiveChildren = true;
        
        this.addEventListeners();
    }

    private createBackground(): Container {
        const graphics = new Graphics()
            .rect(
                this.viewportRectangle.x,
                this.viewportRectangle.y,
                this.viewportRectangle.width,
                this.viewportRectangle.height
            )
            .fill({ color: this.backgroundFillColor });
        graphics.eventMode = 'none';
        graphics.interactiveChildren = false;
        graphics.cacheAsTexture(true);
        return graphics;
    }

    public onBeforeAddToParent(parent: Container): void {
        if (
            parent
            && this.backgroundContainer
            && !this.backgroundContainer.parent
        ) {
            parent.addChild(this.backgroundContainer);
        }
    }

    private addEventListeners(): void {
        this.on('pointerdown', this.onPointerDown, this);
        this.on('globalpointermove', this.onPointerMove, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerupoutside', this.onPointerUp, this);
        this.on('pointercancel', this.onPointerUp, this);
    }
    
    private removeEventListeners(): void {
        this.off('pointerdown', this.onPointerDown, this);
        this.off('globalpointermove', this.onPointerMove, this);
        this.off('pointerup', this.onPointerUp, this);
        this.off('pointerupoutside', this.onPointerUp, this);
        this.off('pointercancel', this.onPointerUp, this);
    }

    public setOnPointerDownActivity(isActive: boolean): void {
        if ((isActive && this.onPointerDownIsActive)
            || (!isActive && !this.onPointerDownIsActive)) {
            return;
        }
        this.onPointerDownIsActive = isActive;
        if (isActive) {
            this.on('pointerdown', this.onPointerDown, this);
        } else {
            this.off('pointerdown', this.onPointerDown, this);
        }
    }
    
    private onPointerDown(event: FederatedPointerEvent): void {
        if (
            this.getShouldPreventEvents()
            || (event.pointerType === 'touch' && !event.isPrimary)
        ) {
            return;
        }
        
        this.isPointerDown = true;
        this.pointerId = event.pointerId;
        
        this.stopInertia();
        
        this.isDragging = true;
        this.dragStartTime = event.timeStamp;
        this.dragStartCoordinate = this.getCoordinate();
        this.lastPointerCoordinate = this.getPointerCoordinate(event);
        
        this.velocityController.clearValues();
        this.velocityController.addValue(0);
        
        event.stopPropagation();
    }
    
    private onPointerMove(event: FederatedPointerEvent): void {
        if (
            !this.isDragging
            || !this.isPointerDown
            || this.getShouldPreventEvents()
            || (this.pointerId !== undefined && event.pointerId !== this.pointerId)
            || !this.getCanScroll()
        ) {
            return;
        }
        
        const currentPointerCoordinate = this.getPointerCoordinate(event);
        const delta = (currentPointerCoordinate - this.lastPointerCoordinate)
            * this.parameters.pointerSensitivity;        
        const newCoordinate = this.getCoordinate() + delta;
        
        this.setCurrentCoordinate(newCoordinate);
        
        const currentTime = event.timeStamp;
        const actualDelta = this.getCoordinate() - this.dragStartCoordinate;
        const timeDelta = currentTime - this.dragStartTime;
        
        if (timeDelta > 0) {
            const frameTime = 1000 / this.ticker.FPS;
            const velocity = actualDelta / timeDelta * frameTime;
            this.velocityController.addValue(velocity);
        }
        
        this.lastPointerCoordinate = currentPointerCoordinate;
        
        event.stopPropagation();
    }

    
    private onPointerUp(event: FederatedPointerEvent): void {
        if (
            !this.isDragging
            || !this.isPointerDown
            || this.getShouldPreventEvents()
            || (this.pointerId !== undefined && event.pointerId !== this.pointerId)
        ) {
            return;
        }
        
        this.isDragging = false;
        this.isPointerDown = false;
        this.pointerId = undefined;
        
        const velocity = this.velocityController.getAverageValue()
            * this.parameters.velocityMultiplier;
        
        this.startInertia(velocity);
        
        event.stopPropagation();
    }
    
    private getCanScroll(): boolean {
        if (this.getIsHorizontal()) {
            return this.contentOriginalSize.width * this.scale.x
                > this.viewportRectangle.width;
        }
        return this.contentOriginalSize.height * this.scale.y
            > this.viewportRectangle.height;
    }
    
    private getPointerCoordinate(event: FederatedPointerEvent): number {
        return this.getIsHorizontal()
            ? event.global.x 
            : event.global.y;
    }
    
    private getCoordinate(): number {
        return this.getIsHorizontal()
            ? this.x
            : this.y;
    }
    
    private setCurrentCoordinate(coordinate: number): void {
        if (this.getIsHorizontal()) {
            this.clampX(coordinate);
        } else {
            this.clampY(coordinate);
        }
    }

    private getIsHorizontal(): boolean {
        return this.parameters.direction === CarouselDirectionType.Horizontal;
    }
    
    private startInertia(velocity: number): void {
        if (
            !this.getCanScroll()
            || Math.abs(velocity) < this.velocityController.getMinValue()
        ) {
            return;
        }
        
        const currentCoordinate = this.getCoordinate();
        
        const deceleratedMotionResult = this.deceleratedMotionController.getResult(
            velocity,
            currentCoordinate,
            this.getMinCoordinate(),
            this.getMaxCoordinate()
        );
        
        this.inertiaController = new InertiaController(
            currentCoordinate,
            velocity,
            deceleratedMotionResult.acceleration,
            deceleratedMotionResult.time
        );
        
        this.isMoving = true;
        this.ticker.add(this.boundOnTicker);
    }
    
    public stopInertia(): void {
        if (this.isMoving) {
            this.isMoving = false;
            this.inertiaController = undefined;
            this.ticker.remove(this.boundOnTicker);
        }
    }

    private getMaxCoordinate(): number {
        if (this.getIsHorizontal()) {
            const contentScaledWidth = this.contentOriginalSize.width * this.scale.x;
            return this.viewportRectangle.right - contentScaledWidth;
        }
        const contentScaledHeight = this.contentOriginalSize.height * this.scale.y;
        return this.viewportRectangle.bottom - contentScaledHeight;
    }
    
    private getMinCoordinate(): number {
        return this.getIsHorizontal() 
            ? this.viewportRectangle.left 
            : this.viewportRectangle.top;
    }
    
    private onTicker(): void {
        if (!this.isMoving || !this.inertiaController) {
            this.stopInertia();
            return;
        }
        
        const deltaTime = this.ticker.deltaMS;
        const increment = this.inertiaController.getIncrement(deltaTime);
        
        // Если изменение очень маленькое, устанавливаем целевую координату
        if (Math.abs(increment) < CarouselContainer.inertiaIncrementEpsilon) {
            if (this.inertiaController.getIsCompleted()) {
                this.setCurrentCoordinate(this.inertiaController.targetValue);
            }
            this.stopInertia();
            return;
        }
        
        const currentCoordinate = this.getCoordinate();
        this.setCurrentCoordinate(currentCoordinate + increment);
        
        if (this.inertiaController.getIsCompleted()) {
            this.setCurrentCoordinate(this.inertiaController.targetValue);
            this.stopInertia();
        }
    }
    
    public setContentSize(contentWidth: number, contentHeight: number): void {
        super.setContentSize(contentWidth, contentHeight);
        this.stopInertia();
        this.velocityController.reset();
    }
    
    public setViewportSize(viewportWidth: number, viewportHeight: number): void {
        super.setViewportSize(viewportWidth, viewportHeight);
        this.stopInertia();
        this.velocityController.reset();
    }
    
    public destroy(options?: DestroyOptions): void {
        this.stopInertia();
        this.removeEventListeners();
        this.velocityController.clearValues();
        this.onDestroy?.();
        super.destroy(options);
    }
}