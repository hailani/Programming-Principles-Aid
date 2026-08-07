//Builds code from the 2D grid (top to bottom)
export const buildTwoDCode = (
    grid: string[][],
    tasks: Record<string, { content: string }>
): string => {
    const lines: string[] = [];

    grid.forEach((row) => {
        const firstTaskId = row.find((cell) => cell);
        if (!firstTaskId) return;

        const task = tasks[firstTaskId];
        if (task) {
            lines.push(task.content);
        }
    });

    return lines.join("\n");
};

//Check if all required positions are filled correctly
export const checkTwoDPlacement = (
    grid: string[][],
    tasks: Record<string, {row?: number; column?: number }>
): boolean => {
    for(let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const taskId = grid[r][c];
            if(!taskId) continue;

            const task = tasks[taskId];
            if (!task) return false;

            if(task.row !== r || task.column !== c) {
                return false;
            }
        }
    }
    return true;
};

//Check if the grid is fully filled (no missing blocks)
export const checkTwoDComplete = (
    grid: string [][],
    tasks: Record<string, any>
): boolean => {
    const placedTasks = new Set<string>();

    grid.forEach((row) => {
        row.forEach((cell) => {
            if (cell) placedTasks.add(cell);
        });
    });

    const requiredTasks = Object.keys(tasks).filter(
        (id) => tasks[id].row !== undefined && tasks[id].column !== undefined
    );

    return requiredTasks.every((id) => placedTasks.has(id));
};

//Color Blocks based on correct/incorrect placement
export const getTwoDBlockColors = (
    grid: string[][],
    tasks: Record<string, { row?: number; column?: number }>
): Record<string, "correct" | "incorrect"> => {
    const colors: Record<string, "correct" | "incorrect"> = {};

    grid.forEach((row, r) => {
        row.forEach((taskId, c) => {
            if (!taskId) return;

            const task = tasks[taskId];
            if (!task) return;

            if (task.row === r && task.column === c){
                colors[taskId] = "correct";
            } else {
                colors[taskId] = "incorrect";
            }
        });
    });

    return colors;
};

//To create a Problem whose type is "2D", you must include row + column
//Example:
/*
    {
        "id": "3",
        "content": "System.out.println(i);",
        "row": 3,
        "column": 2
    }
*/