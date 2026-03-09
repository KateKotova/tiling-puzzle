import { AverageValueParameters } from "../../math/controllers/AverageValueParameters";
import { DeceleratedMotionParameters } from "../../math/controllers/DeceleratedMotionParameters";
import { CarouselDirectionType } from "./CarouselDirectionType";

/**
 * Параметры карусели
 */
export interface CarouselParameters {
    direction: CarouselDirectionType;
    pointerSensitivity: number;
    velocityParameters: AverageValueParameters;
    velocityMultiplier: number;
    deceleratedMotionParameters: DeceleratedMotionParameters;
}