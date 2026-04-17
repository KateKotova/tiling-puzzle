/**
 * Интерфейс параметров масштабирования и панорамирования во viewport-е
 */
export interface ZoomAndPanParameters {
    minScale: number;
    maxScale: number;
    mouseWheelScaleSensitivity: number;
    touchPanSensitivity: number;
    touchScaleSensitivity: number;
}