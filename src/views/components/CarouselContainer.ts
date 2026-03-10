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
import { CarouselParameters } from './CarouselParameters.ts';
import { ViewportContainer } from './ViewportContainer.ts';
import { CarouselInertiaController } from '../controllers/CarouselInertiaController.ts';

/**
 * Класс карусели с инерционной прокруткой
 */
export class CarouselContainer extends ViewportContainer {
    private readonly parameters: CarouselParameters;
    private readonly framesPerSecond: number;
    private readonly inertiaController: CarouselInertiaController;

    private backgroundContainer: Container;
    private backgroundFillColor: Color = new Color(0x007700);
    
    private isDragging: boolean = false;
    public isMoving: boolean = false;
    private dragStartCoordinate: number = 0;
    private dragStartTime: number = 0;
    private lastPointerCoordinate: number = 0;

    private pointerId?: number;
    private isPointerDown: boolean = false;
    private onPointerDownIsActive: boolean = true;

    public getShouldPreventEvents: () => boolean = () => false;
    public onDestroy?: () => void;
    
    constructor(
        parameters: CarouselParameters,
        ticker: Ticker,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);

        this.parameters = parameters;
        this.framesPerSecond = ticker.FPS;
        this.backgroundContainer = this.createBackground();
        
        this.inertiaController = new CarouselInertiaController(
            this,
            ticker,
            parameters.velocityParameters,
            parameters.velocityMultiplier,
            parameters.deceleratedMotionParameters
        );
        
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
        this.inertiaController.removeEventListeners();
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
        
        this.inertiaController.stop();
        
        this.isDragging = true;
        this.dragStartTime = event.timeStamp;
        this.dragStartCoordinate = this.getCoordinate();
        this.lastPointerCoordinate = this.getPointerCoordinate(event);
        
        this.inertiaController.resetVelocity();
        
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
            const frameTime = 1000 / this.framesPerSecond;
            const velocity = actualDelta / timeDelta * frameTime;
            this.inertiaController.addVelocity(velocity);
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
        
        this.inertiaController.restart();
        
        event.stopPropagation();
    }
    
    public getCanScroll(): boolean {
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
    
    public getCoordinate(): number {
        return this.getIsHorizontal()
            ? this.x
            : this.y;
    }
    
    public setCurrentCoordinate(coordinate: number): void {
        if (this.getIsHorizontal()) {
            this.clampX(coordinate);
        } else {
            this.clampY(coordinate);
        }
    }

    private getIsHorizontal(): boolean {
        return this.parameters.direction === CarouselDirectionType.Horizontal;
    }

    public getMaxCoordinate(): number {
        if (this.getIsHorizontal()) {
            const contentScaledWidth = this.contentOriginalSize.width * this.scale.x;
            return this.viewportRectangle.right - contentScaledWidth;
        }
        const contentScaledHeight = this.contentOriginalSize.height * this.scale.y;
        return this.viewportRectangle.bottom - contentScaledHeight;
    }
    
    public getMinCoordinate(): number {
        return this.getIsHorizontal() 
            ? this.viewportRectangle.left 
            : this.viewportRectangle.top;
    }
    
    public setContentSize(contentWidth: number, contentHeight: number): void {
        super.setContentSize(contentWidth, contentHeight);
        this.inertiaController.stop();
        this.inertiaController.resetVelocity();
    }
    
    public setViewportSize(viewportWidth: number, viewportHeight: number): void {
        super.setViewportSize(viewportWidth, viewportHeight);
        this.inertiaController.stop();
        this.inertiaController.resetVelocity();
    }
    
    public destroy(options?: DestroyOptions): void {
        this.inertiaController.stop();
        this.removeEventListeners();
        this.inertiaController.clearVelocities();
        this.onDestroy?.();
        super.destroy(options);
    }
}