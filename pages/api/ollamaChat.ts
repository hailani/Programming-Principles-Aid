import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    try {
        // Grab the data sent from MiloAssistant
        const { userMessage, problemName, problemPrompt, problemAnswer, studentCode } = req.body;
        // used to check if workspace is empty so we can give different instructions to the LLM to ensure it gives relevant hints based on the students current code state
        const isWorkspaceEmpty = !studentCode || studentCode.trim() === "";
           
        
        /*
        1.) The base prompt for the LLM. We give it the problem context, the student's current code,
            and the student's question, and ask it to give a helpful hint based on that information. 
            We also give it some critical rules to follow in its response to ensure it gives helpful and relevant hints without giving away the answer.
        */
         let tutorContext = `
            You are "Milo", a helpful Computer Science tutor helping a student with a Java programming problem.
            The student is currently working on this specific task:
            - Problem Name: ${problemName}
            - Instructions: ${problemPrompt}
            - The expected correct output is: ${problemAnswer}
        `;

            // 3. This will be what the llm should do if the workspace is empty and not hallucinate about code that isn't there
        if (isWorkspaceEmpty) {
            tutorContext += `
            THE WORKSPACE IS CURRENTLY EMPTY. The student has not dragged any blocks from the Code Bank yet.

            The student is asking: "${userMessage}"

            CRITICAL RULES:
            - You MUST start your response EXACTLY with the phrase: "Your workspace is currently empty!"
            - Advise them to look at the Code Bank to find the starting blocks. DO NOT give them the exact blocks to use.
            - Keep your response brief, friendly, and conversational.
            `;
             /*
             4.) 
                This will be what the llm should do if the workspace has some code in it, 
                so it can give hints based on the code the student has already assembled
            */
        } else {
            tutorContext += `
            HERE IS THE CODE THE STUDENT HAS CURRENTLY ASSEMBLED IN THEIR WORKSPACE:
            \`\`\`java
            ${studentCode}
            \`\`\`

    

            CRITICAL RULES:
            - NO REGURGITATION: DO NOT repeat the student's code back to them.
            - First, look at the code they have assembled above. Does it logically satisfy the instructions and output exactly "${problemAnswer}"?
            - IF YES: Congratulate the student and tell them their logic is completely correct, and instruct them to click the "Run" button. DO NOT invent errors or suggest changes.(Note: Assume System.out.print(variable) works perfectly).
            - IF THE OUTPUT IS WRONG: DO NOT congratulate the student. DO NOT say "spot on" or "great job." Point out the specific mistake (for example, printing the wrong variable or a random string).
            - DO NOT give them the exact code or the direct answer to fix it. Do not lecture on concepts outside the scope of the current problem.
            - Keep your response brief, friendly, and conversational.
            
            The student says "${userMessage}"
            `;

            
        }

        // Talk to local Ollama (using 127.0.0.1)
        const ollamaResponse = await axios.post('http://127.0.0.1:11434/api/generate', {
            model: "llama3.2",
            prompt: tutorContext,
            stream: false
        });

        // Send the response back to Milo
        return res.status(200).json({ response: ollamaResponse.data.response });

    } catch (error) {
        // If it fails, print the error to the VS Code terminal
        console.error("Ollama connection error:", error);
        return res.status(500).json({ error: "Failed to connect to the local LLM." });
    }
}