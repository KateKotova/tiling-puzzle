import {
    Color,
    Container,
    ContainerChild,
    ContainerOptions,
    DestroyOptions,
    Graphics,
    GraphicsPath,
    Matrix,
    Renderer,
    Sprite,
    Texture
} from "pixi.js";
import { GlowFilter } from "pixi-filters";
import { HintButtonParameters } from "./HintButtonParameters.ts";

export class HintButton extends Container {
    private readonly parameters: HintButtonParameters;
    private readonly circle: Graphics;
    private readonly iconGraphicsPath: GraphicsPath;
    private readonly defaultIconTexture: Texture;
    private activeIconTexture?: Texture;
    private readonly icon: Sprite;
    private isActive = false;
    private pivotPointCoordinate: number;
    private glowFilter?: GlowFilter;

    private readonly renderer: Renderer;

    private onActivate?: () => void;
    private onDeactivate?: () => void;

    constructor (
        parameters: HintButtonParameters,
        renderer: Renderer,
        iconSvgPath: string,
        onActivate?: () => void,
        onDeactivate?: () => void,
        options?: ContainerOptions<ContainerChild>
    ) {     
        super(options);       
        this.parameters = parameters;
        this.renderer = renderer;
        this.iconGraphicsPath = new GraphicsPath(iconSvgPath);
        this.onActivate = onActivate;
        this.onDeactivate = onDeactivate;

        const glowDistance = this.parameters.glowFilterOptions.distance ?? 0;
        this.pivotPointCoordinate = this.parameters.radius + glowDistance;

        const invisibleRectangle = this.createInvisibleRectangle(this.pivotPointCoordinate * 2);
        this.addChild(invisibleRectangle);

        const circleCoordinate = this.pivotPointCoordinate - this.parameters.radius;
        this.circle = this.createCircle(circleCoordinate, circleCoordinate);
        this.addChild(this.circle);

        const iconCoordinate = this.pivotPointCoordinate - this.parameters.iconSide / 2.0;
        this.defaultIconTexture = this.createIconTexture(this.parameters.defaultIconFillColor);
        this.icon = this.createIcon(iconCoordinate, iconCoordinate);
        this.addChild(this.icon);

        this.pivot.set(this.pivotPointCoordinate, this.pivotPointCoordinate);        
        this.position.set(options?.x ?? 0, options?.y ?? 0);

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
            .circle(this.parameters.radius, this.parameters.radius, this.parameters.radius)
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
        const originalGraphics = new Graphics()
            .path(this.iconGraphicsPath)
            .fill({ color: fillColor });

        const bounds = originalGraphics.getBounds();
        const scale = this.parameters.iconSide / Math.max(bounds.width, bounds.height);
        const matrix = new Matrix().scale(scale, scale);

        const originalTexture = this.renderer.generateTexture({
            target: originalGraphics,
            resolution: 1
        });

        originalGraphics.destroy();

        const graphics = new Graphics()
            .rect(0, 0, bounds.width * scale, bounds.height * scale)
            .fill({
                texture: originalTexture,
                textureSpace: "global",
                matrix
            });

        const result = this.renderer.generateTexture({
            target: graphics,
            resolution: this.parameters.generateTextureResolution,
            textureSourceOptions: {
                scaleMode: "linear"
            }
        });

        graphics.destroy();

        return result;
    }

    private createIcon(left: number, top: number): Sprite {
        const result = new Sprite(this.defaultIconTexture);
        result.position.set(
            left + (this.parameters.iconSide - this.defaultIconTexture.width) / 2.0,
            top + (this.parameters.iconSide - this.defaultIconTexture.height) / 2.0
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
        this.filters = [this.getGlowFilter()];
    }

    private onPointerUp(): void {
        this.isActive = !this.isActive;
        this.showActivityOnPointerUp();
        
        if (this.isActive && this.onActivate) {
            this.onActivate();
        } else if (!this.isActive && this.onDeactivate) {
            this.onDeactivate();
        }
    }

    private onPointerCancel(): void {
        this.showActivityOnPointerUp();
    }

    private showActivityOnPointerUp(): void {
        this.update();
        this.filters = [];
    }

    private update(): void {
        const circlePosition = this.circle.position.clone();
        this.circle.cacheAsTexture(false);
        this.circle
            .clear()
            .circle(this.parameters.radius, this.parameters.radius, this.parameters.radius)
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

    public destroy(options?: DestroyOptions): void {
        this.removeEventListeners();
        this.filters = [];
        if (this.glowFilter) {
            this.glowFilter.destroy();
        }
        super.destroy(options);
    }
}