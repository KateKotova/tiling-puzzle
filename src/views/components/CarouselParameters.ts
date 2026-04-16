import { AverageValueParameters } from "../../math/controllers/AverageValueParameters";
import { DeceleratedMotionParameters } from "../../math/controllers/DeceleratedMotionParameters";

/**
 * Параметры карусели
 */
export interface CarouselParameters {
    pointerSensitivity: number;
    velocityParameters: AverageValueParameters;
    velocityMultiplier: number;
    deceleratedMotionParameters: DeceleratedMotionParameters;
}