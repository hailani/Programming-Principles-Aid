export default interface TaskType {
    id: string;
    content: string;
    isFaded?: boolean;
    correctAnswer?: string;
    userAnswer?: string;
    isDistractor?: boolean;
    rows?: number;
    columns?: number;
}
