import { Point, Polygon } from "pixi.js";

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
}