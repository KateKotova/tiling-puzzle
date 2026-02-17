import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Point
} from 'pixi.js';
import { ViewSettings } from './ViewSettings.ts';
import { AdditionalMath } from '../math/AdditionalMath.ts';
import { Size } from '../math/Size.ts';

/**
 * Класс контейнера-viewport-а,
 * то есть окошка для просмотра содержимого данного контейнера.
 * Масштабирование: сведение или разведение двух пальцев или колёсиком мышки.
 * Перемещение (панорамирование):
 * параллельные движения двумя пальцами или мышкой при удержании правой кнопки.
 */
export class ViewportContainer extends Container {
    private static readonly coordinateEpsilon = 0.1;
    private readonly viewSettings: ViewSettings;
    private isDragging = false;
    private lastMousePosition = new Point();
    private pinchDistance = 0;
    private isPinching = false;
    private lastTouch1 = new Point();
    private lastTouch2 = new Point();
    
    /**
     * Позиция viewport-а, координаты левого верхнего угла относительно родительского контейнера
     */
    private viewportPosition: Point;
    /**
     * Размеры viewport-а, то есть окошка просмотра содержимого
     */
    private viewportSize: Size;
    /**
     * Оригинальные размеры контента без масштабирования
     */
    private contentOriginalSize: Size = new Size(0, 0);
    /**
     * Маска для сокрытия содержимого контента вне viewport-а
     */
    private contentMaskGraphics?: Graphics;    
    /**
     * Начальный масштаб, такой, чтобы контент помещался во viewport
     */
    private scaleOfContentFitToViewport: number = 1;
    
    private boundOnMouseDown: (e: MouseEvent) => void = this.onMouseDown.bind(this);
    private boundOnMouseMove: (e: MouseEvent) => void = this.onMouseMove.bind(this);
    private boundOnMouseUp: (e: MouseEvent) => void = this.onMouseUp.bind(this);
    private boundOnWheel: (e: WheelEvent) => void = this.onWheel.bind(this);

    private boundOnTouchStart: (e: TouchEvent) => void = this.onTouchStart.bind(this);
    private boundOnTouchMove: (e: TouchEvent) => void = this.onTouchMove.bind(this);
    private boundOnTouchEnd: (e: TouchEvent) => void = this.onTouchEnd.bind(this);

    private boundOnContextMenu: (e: Event) => void = this.onContextMenu.bind(this);
    
    constructor(
        viewSettings: ViewSettings,
        options?: ContainerOptions<ContainerChild>
    ) {
        super(options);
        this.viewSettings = viewSettings;
        
        this.viewportPosition = new Point(options?.x ?? 0, options?.y ?? 0);
        this.viewportSize = new Size(options?.width ?? 0, options?.height ?? 0);

        this.createContentMask();
        this.addEventListeners();
    }

    /**
     * Минимальный масштаб относительно начального
     */
    private get minScale(): number {
        return this.viewSettings.viewportMinScale * this.scaleOfContentFitToViewport;
    }
    
    /**
     * Максимальный масштаб относительно начального
     */
    private get maxScale(): number {
        return this.viewSettings.viewportMaxScale * this.scaleOfContentFitToViewport;
    }

    private createContentMask(): void {
        this.contentMaskGraphics = new Graphics();
        this.contentMaskGraphics
            .rect(
                this.viewportPosition.x,
                this.viewportPosition.y,
                this.viewportSize.width,
                this.viewportSize.height
            )
            .fill({
                color: 0xFF0000,
                alpha: 0
            });
        
        // Маска не должна быть дочерним элементом viewport-а.
        // Просто устанавливаем её как маску для контейнера
        this.mask = this.contentMaskGraphics;        
        if (this.parent) {
            this.parent.addChild(this.contentMaskGraphics);
        }
    }

    /**
     * Метод, который нужно вызывать после добавления viewport-а к родителю.
     * Добавляет маску в родительский контейнер
     */
    public onAddedToParent(): void {
        if (
            this.parent
            && this.contentMaskGraphics
            && !this.contentMaskGraphics.parent
        ) {
            this.parent.addChild(this.contentMaskGraphics);
        }
    }
    
    /**
     * Установка размеров контента.
     * Этот метод нужно вызывать после добавления контента
     * @param contentWidth Ширина контента
     * @param contentHeight Высота контента
     */
    public setContentSize(contentWidth: number, contentHeight: number): void {
        this.contentOriginalSize.width = contentWidth;
        this.contentOriginalSize.height = contentHeight;
        
        this.resetScaleOfContentFitToViewport();
        
        this.scale.set(this.scaleOfContentFitToViewport);
        
        const scaledWidth = contentWidth * this.scale.x;
        const scaledHeight = contentHeight * this.scale.y;
        
        this.x = (this.viewportSize.width - scaledWidth) / 2.0;
        this.y = (this.viewportSize.height - scaledHeight) / 2.0;
        
        this.clampPosition();
    }
    
    /**
     * Установка размера viewport-а. Вызывается, если нужно переустановить.
     * @param viewportWidth Ширина viewport-а
     * @param viewportHeight Высота viewport-а
     */
    public setViewportSize(viewportWidth: number, viewportHeight: number): void {
        this.viewportSize.width = viewportWidth;
        this.viewportSize.height = viewportHeight;
        
        if (this.contentMaskGraphics) {
            this.contentMaskGraphics.clear();
            this.contentMaskGraphics
                .rect(0, 0, viewportWidth, viewportHeight)
                .fill({
                    color: 0xFF0000,
                    alpha: 0
                });
        }
        
        if (
            this.contentOriginalSize.width > 0
            && this.contentOriginalSize.height > 0
        ) {
            this.resetScaleOfContentFitToViewport();
            this.clampPosition();
        }
    }

    private resetScaleOfContentFitToViewport() {
        const widthRatio = this.viewportSize.width / this.contentOriginalSize.width;
        const heightRatio = this.viewportSize.height / this.contentOriginalSize.height;
        this.scaleOfContentFitToViewport = Math.min(widthRatio, heightRatio);
    }

    /**
     * Установка позиции viewport-а. Вызывается, если нужно переустановить.
     * @param x Абсцисса левого верхнего угла относительно родительского контейнера
     * @param y Ордината левого верхнего угла относительно родительского контейнера
     */
    public setViewportPosition(x: number, y: number): void {
        this.viewportPosition.set(x, y);
        this.clampPosition();
    }

    /**
     * Установка исходного масштаба (чтобы контент помещался во viewport)
     * и центрирование контента
     */
    public reset(): void {
        this.scale.set(this.scaleOfContentFitToViewport);
        
        const scaledWidth = this.contentOriginalSize.width * this.scale.x;
        const scaledHeight = this.contentOriginalSize.height * this.scale.y;
        
        this.x = this.viewportPosition.x + (this.viewportSize.width - scaledWidth) / 2;
        this.y = this.viewportPosition.y + (this.viewportSize.height - scaledHeight) / 2;
        
        this.clampPosition();
    }

    /**
     * Корректировка позиции с учетом текущего масштаба,
     * чтобы границы контента не вылезали за границы viewport-а
     */
    private clampPosition(): void {
        if (
            this.contentOriginalSize.width <= ViewportContainer.coordinateEpsilon
            || this.contentOriginalSize.height <= ViewportContainer.coordinateEpsilon
        ) {
            return;
        }

        const contentScaledWidth = this.contentOriginalSize.width * this.scale.x;
        const contentScaledHeight = this.contentOriginalSize.height * this.scale.y;

        const viewportLeft = this.viewportPosition.x;
        const viewportRight = this.viewportPosition.x + this.viewportSize.width;
        const viewportTop = this.viewportPosition.y;
        const viewportBottom = this.viewportPosition.y + this.viewportSize.height;

        this.x = contentScaledWidth < this.viewportSize.width
            ? (viewportLeft + viewportRight - contentScaledWidth) / 2.0
            : this.x > viewportLeft
                ? viewportLeft
                : this.x + contentScaledWidth < viewportRight
                    ? viewportRight - contentScaledWidth
                    : this.x;
        this.y = contentScaledHeight < this.viewportSize.height
            ? (viewportTop + viewportBottom - contentScaledHeight) / 2.0
            : this.y > viewportTop
                ? viewportTop
                : this.y + contentScaledHeight < viewportBottom
                    ? viewportBottom - contentScaledHeight
                    : this.y;
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
        const isRightMouseButton = e.button === 2;
        if (isRightMouseButton) {
            this.isDragging = true;
            this.lastMousePosition.set(e.clientX, e.clientY);
            e.preventDefault();
            window.addEventListener('mousemove', this.boundOnMouseMove);
        }
    }
    
    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging) {
            return;
        }
        
        const oldX = this.x;
        const oldY = this.y;
        
        this.x += e.clientX - this.lastMousePosition.x;
        this.y += e.clientY - this.lastMousePosition.y;
        
        this.clampPosition();
        
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
        
        const parentBounds = this.parent?.getBounds();
        if (!parentBounds) {
            return;
        }
        
        const mouseX = e.clientX - parentBounds.left - this.viewportPosition.x;
        const mouseY = e.clientY - parentBounds.top - this.viewportPosition.y;
        
        const contentX = (mouseX - this.x) / this.scale.x;
        const contentY = (mouseY - this.y) / this.scale.y;
        
        const zoomFactor = 1 - e.deltaY * this.viewSettings.viewportMouseWheelScaleSensitivity;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale.x * zoomFactor));
        
        this.scale.set(newScale);
        
        this.x = mouseX - contentX * this.scale.x;
        this.y = mouseY - contentY * this.scale.y;
        
        this.clampPosition();
    }
    
    private onTouchStart(e: TouchEvent): void {
        e.preventDefault();
        
        if (e.touches.length !== 2) {
            return;
        }

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        this.lastTouch1.set(touch1.clientX, touch1.clientY);
        this.lastTouch2.set(touch2.clientX, touch2.clientY);            
        this.pinchDistance = AdditionalMath.getPointDistance(this.lastTouch1, this.lastTouch2);
        
        this.isPinching = true;
        this.isDragging = false;
    }
    
    private onTouchMove(e: TouchEvent): void {
        e.preventDefault();
        
        if (e.touches.length !== 2 || !this.isPinching) {
            return;
        }

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentTouch1 = new Point(touch1.clientX, touch1.clientY);
        const currentTouch2 = new Point(touch2.clientX, touch2.clientY);
        
        const currentDistance = AdditionalMath.getPointDistance(currentTouch1, currentTouch2);
        
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
        
        const angle = AdditionalMath.getAngleBetweenVectors(moveVector1, moveVector2);
        
        const oldX = this.x;
        const oldY = this.y;
        
        const isScrolling = Math.abs(angle) < Math.PI / 6;
        if (isScrolling) {
            const panX = (moveVector1.x + moveVector2.x) / 2.0
                * this.viewSettings.viewportTouchPanSensitivity;
            const panY = (moveVector1.y + moveVector2.y) / 2.0
                * this.viewSettings.viewportTouchPanSensitivity;

            this.x += panX;
            this.y += panY;

            this.clampPosition();
            
            const actualDeltaX = this.x - oldX;
            const actualDeltaY = this.y - oldY;
            
            this.lastTouch1.set(currentTouch1.x - actualDeltaX, currentTouch1.y - actualDeltaY);
            this.lastTouch2.set(currentTouch2.x - actualDeltaX, currentTouch2.y - actualDeltaY);
        } else {
            const relativeX = (centerViewportX - this.x) / this.scale.x;
            const relativeY = (centerViewportY - this.y) / this.scale.y;
            
            const scaleDelta = 1 + (currentDistance / this.pinchDistance - 1)
                * this.viewSettings.viewportTouchScaleSensitivity;
            const newScale = this.scale.x * scaleDelta;
            
            if (newScale >= this.minScale && newScale <= this.maxScale) {
                this.scale.set(newScale);
                
                this.x = centerViewportX - relativeX * this.scale.x;
                this.y = centerViewportY - relativeY * this.scale.y;
                
                this.clampPosition();
                
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
        if (this.contentMaskGraphics) {
            this.contentMaskGraphics.destroy();
            this.contentMaskGraphics = undefined;
        }
        super.destroy(options);
    }
}