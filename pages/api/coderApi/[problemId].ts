import { NextApiRequest, NextApiResponse } from "next";
import { CardResponseType } from "@/common/types/CardResponseType";
import problems from '../../../src/data/problems.json';

// pages/api/coderApi/[problemId].ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { problemId, module, difficulty } = req.query;

    if (typeof problemId === "string") {
        const numberToFind = parseInt(problemId);

        const problem = (problems as CardResponseType[]).find((p) => {
            // Check if the number matches
            const matchesNumber = p.number === numberToFind;
            
            // Check module and difficulty, but make them case-insensitive 
            // and handle cases where they might be missing in the URL
            const matchesModule = !module || p.module.toLowerCase() === (module as string).toLowerCase();
            const matchesDifficulty = !difficulty || p.difficulty.toLowerCase() === (difficulty as string).toLowerCase();

            return matchesNumber && matchesModule && matchesDifficulty;
        });

        if (problem) {
            return res.status(200).json(problem);
        } else {
            // If the strict search fails, try finding JUST by the number as a fallback
            const fallbackProblem = (problems as CardResponseType[]).find(p => p.number === numberToFind);
            if (fallbackProblem) return res.status(200).json(fallbackProblem);

            return res.status(404).json({ message: "Problem not found" });
        }
    }
    res.status(422).json({ message: "Invalid Request" });
}