import {
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    Point,
    Rectangle
} from 'pixi.js';
import { Size } from '../../math/Size.ts';
import { Algorithm } from '../../math/Algorithm.ts';

/**
 * Класс контейнера-viewport-а,
 * то есть окошка для просмотра содержимого данного контейнера.
 */
export class ViewportContainer extends Container {
    private static readonly coordinateEpsilon = 0.1;
    /**
     * Позиция и размеры viewport-а, то есть окошка просмотра содержимого.
     * Здесь позиция - координаты левого верхнего угла относительно родительского контейнера.
     */
    public viewportRectangle: Rectangle;
    /**
     * Глобальные координаты левого верхнего угла вьюпорта.
     */
    public viewportGlobalPosition: Point = new Point(0, 0);
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
        this.viewportRectangle = new Rectangle(
            options?.x ?? 0,
            options?.y ?? 0,
            options?.width ?? 0,
            options?.height ?? 0
        );
        this.createContentMask();
    }

    private createContentMask(): void {
        this.contentMaskGraphics = new Graphics();
        this.contentMaskGraphics
            .rect(
                this.viewportRectangle.x,
                this.viewportRectangle.y,
                this.viewportRectangle.width,
                this.viewportRectangle.height
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
        if (this.parent) {
            this.viewportGlobalPosition = this.parent.toGlobal(new Point(
                this.viewportRectangle.x,
                this.viewportRectangle.y
            ));

            if (this.contentMaskGraphics && !this.contentMaskGraphics.parent) {
                this.parent.addChild(this.contentMaskGraphics);
            }
        }
    }

    public getViewportGlobalRectangle(): Rectangle {
        return new Rectangle(
            this.viewportGlobalPosition.x,
            this.viewportGlobalPosition.y,
            this.viewportRectangle.width,
            this.viewportRectangle.height
        );
    }

    public getPointIsInsideViewportRectangle(globalPoint: Point): boolean {
        return Algorithm.getPointIsInsideRectangle(
            globalPoint,
            this.getViewportGlobalRectangle()
        );
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
        this.clampPosition(this.position.x, this.position.y);
    }
    
    /**
     * Установка размера viewport-а. Вызывается, если нужно переустановить.
     * @param viewportWidth Ширина viewport-а
     * @param viewportHeight Высота viewport-а
     */
    public setViewportSize(viewportWidth: number, viewportHeight: number): void {
        this.viewportRectangle.width = viewportWidth;
        this.viewportRectangle.height = viewportHeight;
        
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
        this.viewportRectangle.x = x;
        this.viewportRectangle.y = y;
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

        this.position.set(this.getClampedX(x), this.getClampedY(y));
    }

    /**
     * Корректировка абсциссы с учетом текущего масштаба,
     * чтобы границы контента не вылезали за границы viewport-а
     * @param x Предполагающаяся абсцисса
     */
    protected clampX(x: number): void {
        if (this.contentOriginalSize.width <= ViewportContainer.coordinateEpsilon) {
            return;
        }

        this.position.x = this.getClampedX(x);
    }

    /**
     * Корректировка ординаты с учетом текущего масштаба,
     * чтобы границы контента не вылезали за границы viewport-а
     * @param y Предполагающаяся ордината
     */
    protected clampY(y: number): void {
        if (this.contentOriginalSize.height <= ViewportContainer.coordinateEpsilon) {
            return;
        }
        
        this.position.y = this.getClampedY(y);
    }

    /**
     * Получение откорректированной абсциссы с учетом текущего масштаба,
     * чтобы границы контента не вылезали за границы viewport-а
     * @param x Предполагающаяся абсцисса
     * @param contentHypotheticalOriginalWidth Гипотетическая оригинальная ширина контенты,
     * то есть не такая, какая есть сейчас на самом деле, а такая,
     * которая будет или предполагается
     * @returns Скорректированная абсцисса
     */
    public getClampedX(x: number, contentHypotheticalOriginalWidth?: number): number {
        const contentOriginalWidth = contentHypotheticalOriginalWidth
            ?? this.contentOriginalSize.width;
        const contentScaledWidth = contentOriginalWidth * this.scale.x;

        const viewportLeft = this.viewportRectangle.left;
        const viewportRight = this.viewportRectangle.right;

        return contentScaledWidth < this.viewportRectangle.width
            ? (viewportLeft + viewportRight - contentScaledWidth) / 2.0
            : x > viewportLeft
                ? viewportLeft
                : x + contentScaledWidth < viewportRight
                    ? viewportRight - contentScaledWidth
                    : x;
    }

    /**
     * Получение откорректированной ординаты с учетом текущего масштаба,
     * чтобы границы контента не вылезали за границы viewport-а
     * @param y Предполагающаяся ордината
     * @param contentHypotheticalOriginalHeight Гипотетическая оригинальная высота контенты,
     * то есть не такая, какая есть сейчас на самом деле, а такая,
     * которая будет или предполагается
     * @returns Скорректированная ордината
     */
    public getClampedY(y: number, contentHypotheticalOriginalHeight?: number): number {
        const contentOriginalHeight = contentHypotheticalOriginalHeight
            ?? this.contentOriginalSize.height;
        const contentScaledHeight = contentOriginalHeight * this.scale.y;

        const viewportTop = this.viewportRectangle.top;
        const viewportBottom = this.viewportRectangle.bottom;

        return contentScaledHeight < this.viewportRectangle.height
            ? (viewportTop + viewportBottom - contentScaledHeight) / 2.0
            : y > viewportTop
                ? viewportTop
                : y + contentScaledHeight < viewportBottom
                    ? viewportBottom - contentScaledHeight
                    : y;
    }

    public destroy(options?: DestroyOptions): void {
        if (this.contentMaskGraphics) {
            this.contentMaskGraphics.destroy();
            this.contentMaskGraphics = undefined;
        }
        super.destroy(options);
    }
}