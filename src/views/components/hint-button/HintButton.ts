import {
    Color,
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    GraphicsPath,
    Point,
    Sprite,
    Texture
} from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { HintButtonParameters } from "./HintButtonParameters.ts";

export class HintButton extends Container {
    public static readonly hintButtonWasActivatedEventName: string
        = "hintButtonWasActivatedEvent";
    public static readonly hintButtonWasDeactivatedEventName: string
        = "hintButtonWasDeactivatedEvent";

    private readonly parameters: HintButtonParameters;
    private readonly radius: number;
    private readonly iconSide: number;
    private readonly invisibleRectangle: Graphics;
    private readonly circle: Graphics;    
    private readonly iconSvgPath: string;
    private readonly iconGraphicsPath: GraphicsPath;
    private iconScale?: number;
    private readonly defaultIconTexture: Texture;
    private activeIconTexture?: Texture;
    private readonly icon: Sprite;
    private isActive = false;
    private pivotPointCoordinate: number;
    private glowFilter?: GlowFilter;

    constructor (
        parameters: HintButtonParameters,
        radius: number,
        iconSvgPath: string,
        centerPoint: Point,
        options?: ContainerOptions<ContainerChild>
    ) {     
        super(options);       
        this.parameters = parameters;
        this.radius = radius;
        this.iconSide = 2 * this.radius * this.parameters.iconSideToDiameterRatio;
        this.iconSvgPath = iconSvgPath;
        this.iconGraphicsPath = new GraphicsPath(iconSvgPath);

        const glowDistance = this.parameters.glowFilterOptions.distance ?? 0;
        this.pivotPointCoordinate = this.radius + glowDistance;

        this.invisibleRectangle = this.createInvisibleRectangle(this.pivotPointCoordinate * 2);
        this.addChild(this.invisibleRectangle);

        const circleCoordinate = this.pivotPointCoordinate - this.radius;
        this.circle = this.createCircle(circleCoordinate, circleCoordinate);
        this.addChild(this.circle);

        const iconCoordinate = this.pivotPointCoordinate - this.iconSide / 2.0;
        this.defaultIconTexture = this.createIconTexture(this.parameters.defaultIconFillColor);
        this.icon = this.createIcon(iconCoordinate, iconCoordinate);
        this.addChild(this.icon);

        this.pivot.set(this.pivotPointCoordinate, this.pivotPointCoordinate);        
        this.position.set(centerPoint.x, centerPoint.y);

        this.eventMode = 'static';
        this.addEventListeners();
    }

    private createInvisibleRectangle(side: number): Graphics {
        const result = new Graphics()
            .rect(0, 0, side, side)
            .fill({
                color: 0xFF0000,
                alpha: 0
            });
        return result;
    }

    private createCircle(left: number, top: number): Graphics {
        const result = new Graphics()
            .circle(this.radius, this.radius, this.radius)
            .fill({ color: this.parameters.defaultFillColor })
            .stroke({
                width: this.parameters.strokeWidth,
                color: this.parameters.defaultStrokeColor
            });
        result.position.set(left, top);
        result.cacheAsTexture({ antialias: true });
        return result;
    }

    private getActiveIconTexture(): Texture {
        if (!this.activeIconTexture) {
            this.activeIconTexture = this.createIconTexture(this.parameters.activeIconFillColor);
        }
        return this.activeIconTexture;
    }

    private createIconTexture(fillColor: Color): Texture {
        const canvas = document.createElement('canvas');
        canvas.width = this.iconSide;
        canvas.height = this.iconSide;
        
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) {
            throw new Error('Cannot get 2d context');
        }
        
        const scale = this.getIconScale();
        canvasContext.scale(scale, scale);
        
        canvasContext.fillStyle = fillColor.toRgbaString();
        canvasContext.fill(new Path2D(this.iconSvgPath));
        
        return Texture.from(canvas);
    }

    private getIconScale(): number {
        if (this.iconScale === undefined) {
            const originalGraphics = new Graphics()
                .path(this.iconGraphicsPath)
                .fill({ color: 0x000000 });
            const iconOriginalBounds = originalGraphics.getBounds();
            originalGraphics.destroy();
            
            this.iconScale = this.iconSide
                / Math.max(iconOriginalBounds.width, iconOriginalBounds.height);
        }
        return this.iconScale;
    }

    private createIcon(left: number, top: number): Sprite {
        const result = new Sprite(this.defaultIconTexture);
        result.position.set(
            left + (this.iconSide - this.defaultIconTexture.width) / 2.0,
            top + (this.iconSide - this.defaultIconTexture.height) / 2.0
        );
        return result;
    }

    private getGlowFilter(): GlowFilter {
        if (!this.glowFilter) {
            this.glowFilter = new GlowFilter(this.parameters.glowFilterOptions);
        }
        return this.glowFilter;
    }

    private addEventListeners(): void {
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerupoutside', this.onPointerCancel, this);
        this.on('pointercancel', this.onPointerCancel, this);
    }
    
    private removeEventListeners(): void {
        this.off('pointerdown', this.onPointerDown, this);
        this.off('pointerup', this.onPointerUp, this);
        this.off('pointerupoutside', this.onPointerCancel, this);
        this.off('pointercancel', this.onPointerCancel, this);
    }

    private onPointerDown(): void {
        if (this.isActive) {
            return;
        }
        this.filters = [this.getGlowFilter()];
    }

    private onPointerUp(): void {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        this.showActivity();
        this.dispatchHintButtonWasActivatedEvent();
    }

    private onPointerCancel(): void {
        this.showActivity();
    }

    public deactivate(): void {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;
        this.showActivity();
        this.dispatchHintButtonWasDeactivatedEvent();
    }

    private showActivity(): void {
        this.update();
        this.filters = null;
    }

    private update(): void {
        const circlePosition = this.circle.position.clone();
        this.circle.cacheAsTexture(false);
        this.circle
            .clear()
            .circle(this.radius, this.radius, this.radius)
            .fill({
                color: this.isActive
                    ? this.parameters.activeFillColor
                    : this.parameters.defaultFillColor
            })
            .stroke({
                width: this.parameters.strokeWidth,
                color: this.isActive
                    ? this.parameters.activeStrokeColor
                    : this.parameters.defaultStrokeColor
            });
        this.circle.position.copyFrom(circlePosition);
        this.circle.cacheAsTexture({ antialias: true });

        this.icon.texture = this.isActive
            ? this.getActiveIconTexture()
            : this.defaultIconTexture;
    }

    private dispatchHintButtonWasActivatedEvent(): void {
        const event = new Event(HintButton.hintButtonWasActivatedEventName);
        window.dispatchEvent(event);
    }

    private dispatchHintButtonWasDeactivatedEvent(): void {
        const event = new Event(HintButton.hintButtonWasDeactivatedEventName);
        window.dispatchEvent(event);
    }

    public destroy(options?: DestroyOptions): void {
        if (this.destroyed) {
            return;
        }
        
        this.eventMode = 'none';
        this.removeEventListeners();
        
        this.filters = null;

        if (this.icon) {
            this.removeChild(this.icon);
            this.icon.destroy();
        }
        
        if (this.circle) {
            this.circle.cacheAsTexture(false);
            this.removeChild(this.circle);
            this.circle.destroy();
        }
        
        if (this.invisibleRectangle) {
            this.removeChild(this.invisibleRectangle);
            this.invisibleRectangle.destroy();
        }
        
        if (this.glowFilter) {
            this.glowFilter.destroy();
            this.glowFilter = undefined;
        }

        this.iconScale = undefined;
        
        if (this.defaultIconTexture && !this.defaultIconTexture.destroyed) {
            this.defaultIconTexture.destroy(true);
        }
        
        if (this.activeIconTexture && !this.activeIconTexture.destroyed) {
            this.activeIconTexture.destroy(true);
            this.activeIconTexture = undefined;
        }
        
        super.destroy(options);
    }
}