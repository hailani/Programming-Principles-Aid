import TaskType from "./TaskType";

export interface CardResponseType {
    problemId: number;
    name: string;
    prompt: string;
    number: number; 
    code: (string | TaskType)[];
    correctOrder?: string[]; // This field is new and will provide the correct order of the code blocks for traditional Parsons problems
    correctOrders?: string[][]; // This field is new and will provide multiple correct orders of the code blocks for traditional Parsons problems that have more than one valid solution
    answer: string;
    module: string; // This field is new and will be used to categorize problems by their respective modules (e.g., "data-types", "loops", "conditionals", etc.)
    difficulty: string; // This field is new and will indicate the difficulty level of the problem (e.g., "easy", "medium", "hard")
    type?: "traditional" | "faded-parsons" | "distractor" | "2d";// NEW: Defines the specific Parsons interaction style
    gridRows?: number;
    gridColumns?: number;
}