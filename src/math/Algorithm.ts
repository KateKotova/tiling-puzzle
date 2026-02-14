/**
 * Класс алгоритмических операций.
 */
export class Algorithm {
    /**
     * Получение массива, элементы которого перемешаны в произвольном порядке
     * @param array Исходный массив
     * @returns Новый массив из элементов исходного массива,
     * чьи элементы перемешаны в произвольном порядке
     */
    public static getShuffledArray<T>(array: T[]): T[] {
        const result = [...array];        
        for (let i = result.length - 1; i > 0; i--) {
            // Случайный индекс от 0 до i
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }        
        return result;
    }
}