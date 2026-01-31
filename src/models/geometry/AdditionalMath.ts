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
        const rotationAngle2 = rotationAngle1 - doublePi;
        return Math.abs(rotationAngle1) <= Math.abs(rotationAngle2)
            ? rotationAngle1
            : rotationAngle2;
    }
}