/**
 * Тип стратегии укладки элементов замощения
 */
export enum TilingLayoutStrategyType {
    /**
     * От краёв к центру
     */
    FromEdgesToCenter = "FromEdgesToCenter",
    /**
     * От центра к краям
     */
    FromCenterToEdges = "FromCenterToEdges",
    /**
     * В произвольном порядке
     */
    Random = "Random"
}