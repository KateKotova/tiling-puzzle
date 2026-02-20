import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Point
} from 'pixi.js';
import { Size } from '../../math/Size.ts';

/**
 * Класс контейнера-viewport-а,
 * то есть окошка для просмотра содержимого данного контейнера.
 */
export class ViewportContainer extends Container {
    private static readonly coordinateEpsilon = 0.1;
    /**
     * Позиция viewport-а, координаты левого верхнего угла относительно родительского контейнера
     */
    protected viewportPosition: Point;
    /**
     * Размеры viewport-а, то есть окошка просмотра содержимого
     */
    protected viewportSize: Size;
    /**
     * Оригинальные размеры контента без масштабирования
     */
    protected contentOriginalSize: Size = new Size(0, 0);
    /**
     * Маска для сокрытия содержимого контента вне viewport-а
     */
    private contentMaskGraphics?: Graphics;    
    
    constructor(options?: ContainerOptions<ContainerChild>) {
        super(options);
        this.viewportPosition = new Point(options?.x ?? 0, options?.y ?? 0);
        this.viewportSize = new Size(options?.width ?? 0, options?.height ?? 0);
        this.createContentMask();
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
    }

    /**
     * Установка позиции viewport-а. Вызывается, если нужно переустановить.
     * @param x Абсцисса левого верхнего угла относительно родительского контейнера
     * @param y Ордината левого верхнего угла относительно родительского контейнера
     */
    public setViewportPosition(x: number, y: number): void {
        this.viewportPosition.set(x, y);
        this.clampPosition(this.x, this.y);
    }

    /**
     * Корректировка позиции с учетом текущего масштаба,
     * чтобы границы контента не вылезали за границы viewport-а
     * @param x Предполагающаяся абсцисса
     * @param y Предполагающаяся ордината
     */
    protected clampPosition(x: number, y: number): void {
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

        x = contentScaledWidth < this.viewportSize.width
            ? (viewportLeft + viewportRight - contentScaledWidth) / 2.0
            : x > viewportLeft
                ? viewportLeft
                : x + contentScaledWidth < viewportRight
                    ? viewportRight - contentScaledWidth
                    : x;
        y = contentScaledHeight < this.viewportSize.height
            ? (viewportTop + viewportBottom - contentScaledHeight) / 2.0
            : y > viewportTop
                ? viewportTop
                : y + contentScaledHeight < viewportBottom
                    ? viewportBottom - contentScaledHeight
                    : y;
        this.position.set(x, y);
    }

    public destroy(options?: DestroyOptions): void {
        if (this.contentMaskGraphics) {
            this.contentMaskGraphics.destroy();
            this.contentMaskGraphics = undefined;
        }
        super.destroy(options);
    }
}