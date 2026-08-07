export const buildFadedCode = (
    taskIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isFaded?: boolean;
        correctAnswer?: string;
        userAnswer?: string;
    }>
): string => {
    return taskIds.map((taskId) => {
        const task = tasks[taskId];
        if (task.isFaded) {
            return task.content.replace("__BLANK__", task.userAnswer || "");
        }
        return task.content;
    }).join("\n");

};

export const updateFadedAnswer = (
    tasks: Record<string, {
        id: string;
        content: string;
        isFaded?: boolean;
        correctAnswer?: string;
        userAnswer?: string;
    }>,
    taskId: string,
    value: string
) => {
    return {
        ...tasks,
        [taskId]: {
            ...tasks[taskId],
            id: tasks[taskId].id,
            userAnswer: value
        }
    };
};

//check if all faded blanks in the workspace are correct
export const checkFadedAnswers = (
    workspaceIds: string[],
    tasks: Record<string, {
        isFaded?: boolean; 
        content: string;
        correctAnswer?: string; 
        userAnswer?: string
    }>
): boolean => {
    return workspaceIds.every ((taskId) => {
        const task = tasks[taskId];
        if (!task.isFaded) return true;
        return (task.userAnswer || "").trim() == (task.correctAnswer || "").trim();
    });
};

export const getFadedInputErrors =(
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isFaded?: boolean;
        correctAnswer?: string;
        userAnswer?: string;
    }>
): string[] => {
    const errors: string [] = [];

    workspaceIds.forEach((taskId) => {
        const task = tasks[taskId];
        if (!task.isFaded) return;

        const userAnswer = (task.userAnswer || "").trim();
        const correctAnswer = (task.correctAnswer || "").trim();

        if (userAnswer !== correctAnswer) {
            errors.push(taskId);
        }
    });
    return errors;
};

export const hasEmptyFadedInputs = (
    workspaceIds: string[],
    tasks: Record<string, {
        id: string;
        content: string;
        isFaded?: boolean;
        correctAnswer?: string;
        userAnswer?: string;
    }>
): boolean => {
    return workspaceIds.some((taskId) => {
        const task = tasks[taskId];
        return task.isFaded && !(task.userAnswer || "").trim();
    });
};

export const checkFadedOrder = (
    workspaceIds: string[],
    correctOrder: string[]
): boolean => {
    return JSON.stringify(workspaceIds) === JSON.stringify(correctOrder);
};

//Checks multiple valid orders
export const checkFadedOrderMultiple = (
    workspaceIds: string[],
    correctOrders: string[][]
): boolean => {
    return correctOrders.some(
        (order) => JSON.stringify(workspaceIds) === JSON.stringify(order)
    );
};

//marks each workspace block as correct or incorrect based on its position
export const getFadedBlockColors = (
    workspaceIds: string[],
    correctOrder: string[]
): Record<string, "correct" | "incorrect"> => {
    const colors: Record<string, "correct" | "incorrect"> = {};

    workspaceIds.forEach((taskId, index) => {
        colors[taskId] = correctOrder[index] === taskId ? "correct" : "incorrect";
    });
    return colors;
};

//finds which valid order the user mathed, if any
export const getMatchingFadedOrder = (
    workspaceIds: string[],
    correctOrders: string[][]
): string[] | null => {
    const match = correctOrders.find(
        (order) => JSON.stringify(workspaceIds) === JSON.stringify(order)
    );
    return match || null;
};

