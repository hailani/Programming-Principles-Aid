//takes the blocks in the workspace and turns them into runnable code
export const buildTraditionalCode = (
    taskIds: string[],
    tasks: Record<string, {content: string}>
): string => {
    return taskIds.map((taskId) => tasks[taskId].content).join("\n");
};

//checks if the workspace blocks are in the exact correct order
export const checkTraditionalOrder = (
    workspaceIds: string[],
    correctOrder: string[]
): boolean => {
    return JSON.stringify(workspaceIds) === JSON.stringify(correctOrder);
};

export const checkTraditionalOrderMultiple = (
    workspaceIds: string[],
    correctOrders: string[][]
): boolean => {
    return correctOrders.some(
        (order) => JSON.stringify(workspaceIds) === JSON.stringify(order)
    );
};

//marks each workspace block as correct or incorrect based on its position in the workspace compared to the correct order
export const getTraditionalBlockColors = (
    workspaceIds: string[],
    correctOrder: string[]
): Record<string, "correct" | "incorrect"> => {
    const colors: Record<string, "correct" | "incorrect"> = {};

    workspaceIds.forEach((taskId, index) => {
        colors[taskId] = correctOrder[index] === taskId ? "correct" : "incorrect";
    });

    return colors;
}

export const getMatchingCorrectOrder = (
    workspaceIds: string[],
    correctOrders: string[][]
): string[] | null => {
    const match = correctOrders.find(
        (order) => JSON.stringify(workspaceIds) === JSON.stringify(order)
    );
    return match || null;
};