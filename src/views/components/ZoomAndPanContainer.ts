import {
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Point
} from 'pixi.js';
import { Algorithm } from '../../math/Algorithm.ts';
import { ViewportContainer } from './ViewportContainer.ts';
import { ZoomAndPanParameters } from './ZoomAndPanParameters.ts';

/**
 * Класс контейнера-viewport-а с возможностью масштабирования и панорамирования,
 * то есть окошка для просмотра содержимого данного контейнера.
 * Масштабирование: сведение или разведение двух пальцев или колёсиком мышки.
 * Перемещение (панорамирование):
 * параллельные движения двумя пальцами или мышкой при удержании правой кнопки.
 */
export class ZoomAndPanContainer extends ViewportContainer {
    private readonly parameters: ZoomAndPanParameters;
    private isDragging = false;
    private lastMousePosition = new Point();
    private pinchDistance = 0;
    private isPinching = false;
    private lastTouch1 = new Point();
    private lastTouch2 = new Point();
    
    /**
     * Начальный масштаб, такой, чтобы контент помещался во viewport
     */
    private scaleOfContentFitToViewport: number = 1;

    /**
     * Функция, которая показывает, что следует предотвращать события
     */
    public getShouldPreventEvents: () => boolean = () => false;
    
    private boundOnMouseDown: (e: MouseEvent) => void = this.onMouseDown.bind(this);
    private boundOnMouseMove: (e: MouseEvent) => void = this.onMouseMove.bind(this);
    private boundOnMouseUp: (e: MouseEvent) => void = this.onMouseUp.bind(this);
    private boundOnWheel: (e: WheelEvent) => void = this.onWheel.bind(this);

    private boundOnTouchStart: (e: TouchEvent) => void = this.onTouchStart.bind(this);
    private boundOnTouchMove: (e: TouchEvent) => void = this.onTouchMove.bind(this);
    private boundOnTouchEnd: (e: TouchEvent) => void = this.onTouchEnd.bind(this);

    private boundOnContextMenu: (e: Event) => void = this.onContextMenu.bind(this);
    
    constructor(
        parameters: ZoomAndPanParameters,
        options?: ContainerOptions<ContainerChild>        
    ) {
        super(options);
        this.parameters = parameters;        
        this.addEventListeners();
    }

    /**
     * Минимальный масштаб относительно начального
     */
    private get minScale(): number {
        return this.parameters.minScale * this.scaleOfContentFitToViewport;
    }
    
    /**
     * Максимальный масштаб относительно начального
     */
    private get maxScale(): number {
        return this.parameters.maxScale * this.scaleOfContentFitToViewport;
    }

    public setContentSize(contentWidth: number, contentHeight: number): void {
        super.setContentSize(contentWidth, contentHeight);
        
        this.resetScaleOfContentFitToViewport();
        
        this.scale.set(this.scaleOfContentFitToViewport);
        
        const scaledWidth = contentWidth * this.scale.x;
        const scaledHeight = contentHeight * this.scale.y;
        
        const x = (this.viewportRectangle.width - scaledWidth) / 2.0;
        const y = (this.viewportRectangle.height - scaledHeight) / 2.0;
        
        this.clampPosition(x, y);
    }
    
    public setViewportSize(viewportWidth: number, viewportHeight: number): void {
        super.setViewportSize(viewportWidth, viewportHeight);

        if (
            this.contentOriginalSize.width > 0
            && this.contentOriginalSize.height > 0
        ) {
            this.resetScaleOfContentFitToViewport();
            this.clampPosition(this.x, this.y);
        }
    }

    private resetScaleOfContentFitToViewport() {
        const widthRatio = this.viewportRectangle.width / this.contentOriginalSize.width;
        const heightRatio = this.viewportRectangle.height / this.contentOriginalSize.height;
        this.scaleOfContentFitToViewport = Math.min(widthRatio, heightRatio);
    }

    /**
     * Установка исходного масштаба (чтобы контент помещался во viewport)
     * и центрирование контента
     */
    public reset(): void {
        this.scale.set(this.scaleOfContentFitToViewport);
        
        const scaledWidth = this.contentOriginalSize.width * this.scale.x;
        const scaledHeight = this.contentOriginalSize.height * this.scale.y;
        
        const x = this.viewportRectangle.x + (this.viewportRectangle.width - scaledWidth) / 2;
        const y = this.viewportRectangle.y + (this.viewportRectangle.height - scaledHeight) / 2;
        
        this.clampPosition(x, y);
    }

    private addEventListeners(): void {
        window.addEventListener('mousedown', this.boundOnMouseDown);
        window.addEventListener('mouseup', this.boundOnMouseUp);
        window.addEventListener('wheel', this.boundOnWheel, { passive: false });
        
        window.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
        window.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
        window.addEventListener('touchend', this.boundOnTouchEnd);
        window.addEventListener('touchcancel', this.boundOnTouchEnd);
        
        window.addEventListener('contextmenu', this.boundOnContextMenu);
    }

    private removeEventListeners(): void {
        window.removeEventListener('mousedown', this.boundOnMouseDown);
        window.removeEventListener('mousemove', this.boundOnMouseMove);
        window.removeEventListener('mouseup', this.boundOnMouseUp);
        window.removeEventListener('wheel', this.boundOnWheel);
        
        window.removeEventListener('touchstart', this.boundOnTouchStart);
        window.removeEventListener('touchmove', this.boundOnTouchMove);
        window.removeEventListener('touchend', this.boundOnTouchEnd);
        window.removeEventListener('touchcancel', this.boundOnTouchEnd);
        
        window.removeEventListener('contextmenu', this.boundOnContextMenu);
    }

    private onMouseDown(e: MouseEvent): void {
        if (this.getShouldPreventEvents()) {
            return;
        }
        
        const isRightMouseButton = e.button === 2;
        if (isRightMouseButton) {
            this.isDragging = true;
            this.lastMousePosition.set(e.clientX, e.clientY);
            e.preventDefault();
            window.addEventListener('mousemove', this.boundOnMouseMove);
        }
    }
    
    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging || this.getShouldPreventEvents()) {
            return;
        }
        
        const oldX = this.x;
        const oldY = this.y;
        
        const x = this.x + e.clientX - this.lastMousePosition.x;
        const y = this.y + e.clientY - this.lastMousePosition.y;
        
        this.clampPosition(x, y);
        
        const actualDeltaX = this.x - oldX;
        const actualDeltaY = this.y - oldY;
        
        this.lastMousePosition.x += actualDeltaX;
        this.lastMousePosition.y += actualDeltaY;
    }

    private onMouseUp(e: MouseEvent): void {
        const isRightMouseButton = e.button === 2;
        if (isRightMouseButton) {
            this.isDragging = false;
            window.removeEventListener('mousemove', this.boundOnMouseMove);
        }
    }
    
    private onWheel(e: WheelEvent): void {
        e.preventDefault();

        if (this.getShouldPreventEvents()) {
            return;
        }
        
        const parentBounds = this.parent?.getBounds();
        if (!parentBounds) {
            return;
        }
        
        const mouseX = e.clientX - parentBounds.left - this.viewportRectangle.x;
        const mouseY = e.clientY - parentBounds.top - this.viewportRectangle.y;
        
        const contentX = (mouseX - this.x) / this.scale.x;
        const contentY = (mouseY - this.y) / this.scale.y;
        
        const zoomFactor = 1 - e.deltaY * this.parameters.mouseWheelScaleSensitivity;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale.x * zoomFactor));
        
        this.scale.set(newScale);
        
        const x = mouseX - contentX * this.scale.x;
        const y = mouseY - contentY * this.scale.y;
        
        this.clampPosition(x, y);
    }
    
    private onTouchStart(e: TouchEvent): void {
        e.preventDefault();

        if (e.touches.length !== 2 || this.getShouldPreventEvents()) {
            return;
        }

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        this.lastTouch1.set(touch1.clientX, touch1.clientY);
        this.lastTouch2.set(touch2.clientX, touch2.clientY);            
        this.pinchDistance = Algorithm.getPointDistance(this.lastTouch1, this.lastTouch2);
        
        this.isPinching = true;
        this.isDragging = false;
    }
    
    private onTouchMove(e: TouchEvent): void {
        e.preventDefault();
        
        if (
            e.touches.length !== 2
            || !this.isPinching
            || this.getShouldPreventEvents()
        ) {
            return;
        }

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentTouch1 = new Point(touch1.clientX, touch1.clientY);
        const currentTouch2 = new Point(touch2.clientX, touch2.clientY);
        
        const currentDistance = Algorithm.getPointDistance(currentTouch1, currentTouch2);
        
        const centerX = (currentTouch1.x + currentTouch2.x) / 2.0;
        const centerY = (currentTouch1.y + currentTouch2.y) / 2.0; 
        
        const parentBounds = this.parent?.getBounds();
        if (!parentBounds) {
            return;
        }
        
        const centerViewportX = centerX - parentBounds.left - this.parent!.x;
        const centerViewportY = centerY - parentBounds.top - this.parent!.y;

        const moveVector1 = new Point(
            currentTouch1.x - this.lastTouch1.x,
            currentTouch1.y - this.lastTouch1.y
        );
        const moveVector2 = new Point(
            currentTouch2.x - this.lastTouch2.x,
            currentTouch2.y - this.lastTouch2.y
        );
        
        const angle = Algorithm.getAngleBetweenVectors(moveVector1, moveVector2);
        
        const oldX = this.x;
        const oldY = this.y;
        
        const isScrolling = Math.abs(angle) < Math.PI / 6;
        if (isScrolling) {
            const panX = (moveVector1.x + moveVector2.x) / 2.0
                * this.parameters.touchPanSensitivity;
            const panY = (moveVector1.y + moveVector2.y) / 2.0
                * this.parameters.touchPanSensitivity;

            const x = this.x + panX;
            const y = this.y + panY;

            this.clampPosition(x, y);
            
            const actualDeltaX = this.x - oldX;
            const actualDeltaY = this.y - oldY;
            
            this.lastTouch1.set(currentTouch1.x - actualDeltaX, currentTouch1.y - actualDeltaY);
            this.lastTouch2.set(currentTouch2.x - actualDeltaX, currentTouch2.y - actualDeltaY);
        } else {
            const relativeX = (centerViewportX - this.x) / this.scale.x;
            const relativeY = (centerViewportY - this.y) / this.scale.y;
            
            const scaleDelta = 1 + (currentDistance / this.pinchDistance - 1)
                * this.parameters.touchScaleSensitivity;
            const newScale = this.scale.x * scaleDelta;
            
            if (newScale >= this.minScale && newScale <= this.maxScale) {
                this.scale.set(newScale);
                
                const x = centerViewportX - relativeX * this.scale.x;
                const y = centerViewportY - relativeY * this.scale.y;
                
                this.clampPosition(x, y);
                
                this.pinchDistance = currentDistance;
                
                const actualDeltaX = this.x - oldX;
                const actualDeltaY = this.y - oldY;
                
                this.lastTouch1.set(currentTouch1.x - actualDeltaX, currentTouch1.y - actualDeltaY);
                this.lastTouch2.set(currentTouch2.x - actualDeltaX, currentTouch2.y - actualDeltaY);
            } else {
                const actualDeltaX = this.x - oldX;
                const actualDeltaY = this.y - oldY;
                
                this.lastTouch1.set(currentTouch1.x - actualDeltaX, currentTouch1.y - actualDeltaY);
                this.lastTouch2.set(currentTouch2.x - actualDeltaX, currentTouch2.y - actualDeltaY);
            }
        }
    }
    
    private onTouchEnd(e: TouchEvent): void {
        if (e.touches.length < 2) {
            this.isPinching = false;
        }
    }
    
    private onContextMenu(e: Event): void {
        e.preventDefault();
    }
    
    public destroy(options?: DestroyOptions): void {
        this.removeEventListeners();
        super.destroy(options);
    }
}