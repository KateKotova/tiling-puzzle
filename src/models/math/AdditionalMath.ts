import { Point, Polygon, Rectangle } from "pixi.js";

export class AdditionalMath {
    public static getNormalizedAngle(angleInRadians: number): number {
        const doublePi = 2 * Math.PI;
        let result = angleInRadians % doublePi;
        if (result < 0) {
            result += doublePi;
        }
        return result;
    }

    public static getMinAngleDifference(currentNormalizedAngleInRadians: number,
        targetNormalizedAngleInRadians: number) {

        const doublePi = 2 * Math.PI;
        const rotationAngle1 = targetNormalizedAngleInRadians - currentNormalizedAngleInRadians;
        const rotationAngle2 = rotationAngle1
            + doublePi * (rotationAngle1 >= 0 ? -1 : 1);
        return Math.abs(rotationAngle1) <= Math.abs(rotationAngle2)
            ? rotationAngle1
            : rotationAngle2;
    }

    public static getRegularPolygon(centerPoint: Point,
        circumscribedCircleRadius: number,
        sideCount: number,
        initialRotationAngle: number = 0): Polygon {

        if (sideCount < 3) {
            throw new Error('sideCount should not be less then 3');
        }
        if (circumscribedCircleRadius <= 0) {
            throw new Error('circumscribedCircleRadius should be positive');
        }

        const points: number[] = [];
        const angleStep = (2 * Math.PI) / sideCount;
        
        for (let i = 0; i < sideCount; i++) {
            const angle = -Math.PI / 2 + i * angleStep + initialRotationAngle;
            
            const x = centerPoint.x + circumscribedCircleRadius * Math.cos(angle);
            const y = centerPoint.y + circumscribedCircleRadius * Math.sin(angle);
            
            points.push(x, y);
        }
        
        return new Polygon(points);
    }

    public static getPointIsInsideRectangle(point: Point, rectangle: Rectangle): boolean {
        return point.x >= rectangle.x
            && point.y >= rectangle.y
            && point.x <= rectangle.x + rectangle.width
            && point.y <= rectangle.y + rectangle.height;
    }

    public static getPointIsInsidePolygon(point: Point, polygon: Polygon): boolean {
        const points = polygon.points;
        if (points.length < 3) {
            return false;
        }
        
        const x = point.x;
        const y = point.y;
        let result = false;
        
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i * 2];
            const yi = points[i * 2 + 1];
            const xj = points[j * 2];
            const yj = points[j * 2 + 1];
            
            const intersects = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersects) {
                result = !result;
            }
        }
        
        return result;
    }
}