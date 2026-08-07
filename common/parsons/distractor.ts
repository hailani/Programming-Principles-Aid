import { workerData } from "worker_threads";

export const buildDistractorCode = (
    taskIds: string [],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>
): string => {
    return taskIds.map((taskId) => tasks[taskId].content).join("\n");
};

export const hasDistractorBlocks = (
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>
): boolean => {
    return workspaceIds.some((taskId) => tasks[taskId].isDistractor);
};

export const getDistractorBlockIds = (
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>
): string[] => {
    return workspaceIds.filter((taskId) => tasks[taskId].isDistractor);
};

export const checkDistractorOrder=(
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>,
    correctOrder: string[]
): boolean => {
    const filteredIds = workspaceIds.filter((taskId) => !tasks[taskId].isDistractor);
    return JSON.stringify(filteredIds) === JSON.stringify(correctOrder);
};

export const checkDistractorOrderMultiple = (
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>,
    correctOrders: string[][]
): boolean => {
    const filteredIds = workspaceIds.filter((taskId) => !tasks[taskId].isDistractor);
    return correctOrders.some(
        (order) => JSON.stringify(filteredIds) === JSON.stringify(order)
    );
};

export const getMatchingDistractorOrder = (
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>,
    correctOrders: string[][]
): string[] | null => {
    const filteredIds = workspaceIds.filter((taskId) => !tasks[taskId].isDistractor);
    const match = correctOrders.find(
        (order) => JSON.stringify(filteredIds) === JSON.stringify(order)
    );
    return match || null;
};

export const getDistractorBlockColors = (
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isDistractor?: boolean;
    }>,
    correctOrder: string[]
): Record<string, "correct" | "incorrect"> => {
    const colors: Record<string, "correct" | "incorrect"> = {};
    let correctIndex = 0;

    workspaceIds.forEach((taskId) => {
        const task = tasks[taskId];
        if (task.isDistractor) {
            colors[taskId] = "incorrect";
            return;
        }

        colors[taskId] = correctOrder[correctIndex] === taskId ? "correct" : "incorrect";
        correctIndex++;
    });

    return colors;
};