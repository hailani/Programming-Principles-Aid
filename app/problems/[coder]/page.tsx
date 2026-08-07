"use client";

import "./(styles)/codeStyle.css";
import { useEffect, useState } from "react";
import {CardResponseType} from "@/common/types/CardResponseType";
import React from 'react'
import {DragDropContext} from "react-beautiful-dnd";
import {Flex, Heading, Text, Box, Spinner} from "@chakra-ui/react";
import Column from "@/app/problems/[coder]/(components)/column";
import ModalComponent from "@/app/problems/[coder]/(components)/modal";
import interpreter from "@/app/problems/[coder]/(components)/interpreter/interpreter.js";
import { ChakraProvider } from "@chakra-ui/provider";
import theme from "../theme";
import MiloAssistant from "@/app/MiloAssistant";
import NextLink from "next/link";
import {Link as ChakraLink} from "@chakra-ui/react";
import { useSearchParams } from 'next/navigation';
// Parsons Logic Imports
import { buildTraditionalCode, checkTraditionalOrder, checkTraditionalOrderMultiple, getMatchingCorrectOrder, getTraditionalBlockColors } from "@/common/parsons/traditional";
import { buildFadedCode, updateFadedAnswer, checkFadedAnswers, checkFadedOrder, getFadedBlockColors, checkFadedOrderMultiple, getMatchingFadedOrder,getFadedInputErrors, hasEmptyFadedInputs } from "@/common/parsons/faded";
import { buildDistractorCode, hasDistractorBlocks, getDistractorBlockIds, checkDistractorOrder, checkDistractorOrderMultiple, getMatchingDistractorOrder, getDistractorBlockColors } from "@/common/parsons/distractor";
import problemsData from "@/src/data/problems.json";
import { buildTwoDCode, checkTwoDPlacement, checkTwoDComplete, getTwoDBlockColors } from "@/common/parsons/twoD";
import TwoDWorkspace from "@/common/parsons/TwoDWorkspace";

/* Jayla - Type Definitions
type Task = represents a single draggable code block
    -id: unique identifier for the task
    -content: the text displayed on the code block
type CoulmnType = defines the structure of a column in the drag-and-drop interface
    -id: unique identifier for the column
    -title: the title displayed at the top of the column
    -taskIds: an array of task ids that are currently in the column
type StateType = defines the overall state structure for the drag-and-drop board
    -tasks: a record mapping task ids to Task objects
    -columns: collection of all code blocks
    -columnOrder: determins the order the columns appear on the page
*/



/* Jayla - Type Definitions */
type Task = {
    id: string;
    content: string;
    isFaded?: boolean;
    correctAnswer?: string;
    userAnswer?: string;
    isDistractor?: boolean;
    row?: number;
    column?: number;
};

type ColumnType = {
    id: string;
    title: string;
    taskIds: string[];
};

type StateType = {
    tasks: Record<string, Task>;
    columns: Record<string, ColumnType>;
    columnOrder: string[];
}

/*  Skye - Type Definition */
type TaskStatus = "correct" | "incorrect";

type FeedbackState = {
    status: "" | "correct" | "incorrect";
    summary: string;
    blockColors: Record<string, TaskStatus>;
};

export default function Page({params}: { params: { coder: number } }) {
    // Creates 8 spark pieces for each firework burst.
    const fireworkSparks = Array.from({ length: 8 }, (_, index) => index);
    const [problem, setProblem] = useState<CardResponseType>();
    const searchParams = useSearchParams();
    const moduleParam = searchParams.get('module');
    const difficultyParam = searchParams.get('difficulty');
    const [runCount, setRunCount] = useState(0);
    const [state, setState] = useState<StateType>({
        tasks: {},
        columns: {
            '1': { id: '1', title: "Code Bank", taskIds: [] },
            '2': { id: '2', title: "WorkSpace", taskIds: [] },
        },
        columnOrder: ['1', '2'],
    });
// status checks for modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMiloOpen, setIsMiloOpen] = useState(false); 
    const [running, setOutput] = useState<string>("");
    const [hasMounted, setHasMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showWarningModal, setShowWarningModal] = useState(false);
    // Controls whether the success fireworks overlay is visible.
    const [showSuccessEffect, setShowSuccessEffect] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>({
        status: "",
        summary: "",
        blockColors: {},
    });

    
    // Status states for Parsons checking
    const [resultStatus, setResultStatus] = useState("");
    const [feedbackSummary, setFeedbackSummary] = useState("");
    const [blockColors, setBlockColors] = useState<Record<string, TaskStatus>>({});

    const [workspaceGrid, setWorkspaceGrid] = useState<string[][]>([]);


    useEffect(() => {
        setHasMounted(true); 
        getProblemInfo();
    }, [])

    /* ] Skye - fireworks Celebration logic */
    useEffect(() => {
        // If the effect is off, there is nothing to time.
        if (!showSuccessEffect) return;

        // Hides the fireworks shortly after they appear.
        const successTimer = window.setTimeout(() => {
            setShowSuccessEffect(false);
        }, 1200);

        // Clears the timer if the component updates before the timeout finishes.
        return () => window.clearTimeout(successTimer);
    }, [showSuccessEffect]);

    /*  Rahdyce - getProblemInfo fetches data from the local JSON file */
    const getProblemInfo = () => {
        try {
            setIsLoading(true);

            // Locating the specific problem from the local JSON file
           const problemData = (problemsData as any[]).find((p) =>
                p.problemId === Number(params.coder) &&
                p.module === moduleParam &&
                p.difficulty === difficultyParam
            );

            if (!problemData) {
                console.error("Problem not found in local JSON!");
                return;
            }

            setProblem(problemData);

            if (problemData.code) {
                const newTasks: Record<string, Task> = {};
                const newTaskIds: string[] = [];

                problemData.code.forEach((snippet: any, index: number) => {
                    const id = typeof snippet === "string" ? (index + 1).toString() : String(snippet.id);
                    
                    newTasks[id] = {
                        id,
                        content: typeof snippet === "string" ? snippet : snippet.content,
                        isFaded: snippet.isFaded || false,
                        correctAnswer: snippet.correctAnswer || "",
                        userAnswer: "",
                        isDistractor: snippet.isDistractor || false,
                        row: typeof snippet === "string" ? undefined : snippet.row,
                        column: typeof snippet === "string" ? undefined : snippet.column
                    };
                    newTaskIds.push(id);
                });
                  if (problemData.type === "2d") {
                    const rows = problemData.gridRows || 0;
                    const cols = problemData.gridColumns || 0;

                    const emptyGrid = Array.from({ length: rows}, () =>
                        Array.from({ length:cols }, () => "")
                    );

                    setWorkspaceGrid(emptyGrid);
                }

                setState({
                    tasks: newTasks,
                    columns: {
                        '1': { id: '1', title: "Code Bank", taskIds: newTaskIds },
                        '2': { id: '2', title: "WorkSpace", taskIds: [] }
                    },
                    columnOrder: ['1', '2']
                });
            }
        } catch (error) {
            console.error("Failed to load problem from JSON:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const refresh = () => window.location.reload(); 
    
    //  Connects the Hint button to Milo!
    const hint = () => { 
    if (runCount >= 2) {
        setIsMiloOpen(true); 
    } else {
     //Alert the user why it's not opening
        setShowWarningModal(true);
    }
};

    // Update state for faded input answers
    const handleFadedInputChange = (taskId: string, value: string) => {
        setState((prevState) => ({
            ...prevState,
            tasks: updateFadedAnswer(prevState.tasks, taskId, value)
        }));
        setBlockColors({});
        setResultStatus("");
        setFeedbackSummary("");
    };


    const handleRemoveFromGrid = (row: number, column: number) => {
        const taskId = workspaceGrid[row][column];
        if (!taskId) return;

        setWorkspaceGrid((prev) => {
            const newGrid = prev.map((r) => [...r]);
            newGrid[row][column] = "";
            return newGrid;
        });

        setState((prevState) => ({
            ...prevState,
            columns: {
                ...prevState.columns,
                "1": {
                    ...prevState.columns["1"],
                    taskIds: [...prevState.columns["1"].taskIds, taskId]
                }
            }
        }));

        setBlockColors({});
        setResultStatus("");
        setFeedbackSummary("");
    };

    const onDragEnd = (result: any) => {
        const {destination, source, draggableId} = result;
        if (!destination) return;
    
        const sourceCol = state.columns[source.droppableId];
        const destinationCol = state.columns[destination.droppableId];
        
        const is2DProblem = problem?.type === "2d";
        const destinationIsGrid = destination.droppableId.startsWith("grid-");
        const sourceIsGrid = source.droppableId.startsWith("grid-")

         if(is2DProblem && (destinationIsGrid  || sourceIsGrid)) {
            setWorkspaceGrid((prevGrid) => {
                const newGrid = prevGrid.map((row) => [...row]);

                if(sourceIsGrid) {
                    const [, sourceRow, sourceCol] = source.droppableId.split("-");
                    newGrid[Number(sourceRow)][Number(sourceCol)] = "";
                 }

                if(destinationIsGrid) {
                    const [, destRow, destCol] = destination.droppableId.split("-");

                    if (newGrid[Number(destRow)][Number(destCol)]) {
                        return prevGrid;
                    }

                    newGrid[Number(destRow)][Number(destCol)] = draggableId;

                   if(!sourceIsGrid) {
                        setState((prevState) => ({
                            ...prevState,
                            columns: {
                                ...prevState.columns,
                                "1": {
                                    ...prevState.columns["1"],
                                    taskIds: prevState.columns["1"].taskIds.filter(
                                        (id) => id !== draggableId
                                    )
                                }
                            }
                        }));
                    }
                }

                if(sourceIsGrid && destination.droppableId === "1") {
                    setState((prevState) => ({
                        ...prevState,
                        columns: {
                            ...prevState.columns,
                            "1": {
                                ...prevState.columns["1"],
                                taskIds: prevState.columns["1"].taskIds.filter(
                                    (id) => id !== draggableId
                                )
                            }
                        }
                    }));
                }

               
                return newGrid;

            });
            setBlockColors({});
            setResultStatus("");
            setFeedbackSummary("");
           
            return;
        }
        //  Reordering logic
        if (sourceCol.id === destinationCol.id) {
            const newTaskIds = Array.from(sourceCol.taskIds);
            const [removed] = newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, removed);
            setState({
                ...state,
                columns: { ...state.columns, [sourceCol.id]: { ...sourceCol, taskIds: newTaskIds } }
            });
        } else {
            const startTaskIds = Array.from(sourceCol.taskIds);
            const [removed] = startTaskIds.splice(source.index, 1);
            const endTaskIds = Array.from(destinationCol.taskIds);
            endTaskIds.splice(destination.index, 0, removed);
            
            setState({
                ...state,
                columns: {
                    ...state.columns,
                    [sourceCol.id]: { ...sourceCol, taskIds: startTaskIds },
                    [destinationCol.id]: { ...destinationCol, taskIds: endTaskIds }
                }
            });
        }
        setBlockColors({});
        setResultStatus("");
        setFeedbackSummary("");

    };
    

    const run = async () => {
        // Increment the run counter
        setRunCount(prev => prev + 1);
        const workspaceIds = state.columns["2"].taskIds;
        // Handle multiple solution paths
        const hasMultipleOrders = !!problem?.correctOrders && problem.correctOrders.length > 0;
        let orderCorrect = false;
        let referenceOrder: string[] = [];
        let fadedAnswersCorrect = true;

        if (problem?.type === "faded-parsons") {
            if (hasEmptyFadedInputs(workspaceIds, state.tasks)) {
                setResultStatus("incorrect");
                setFeedbackSummary("Please fill in all faded blanks before running your code.");
                openModal();
                return;
            }
        }

        // Build blocklist based on problem type
        const blocklist = problem?.type === "faded-parsons" 
            ? buildFadedCode(workspaceIds, state.tasks)
            : problem?.type === "distractor"
            ? buildDistractorCode(workspaceIds, state.tasks)
             : problem?.type === "2d"
            ? buildTwoDCode(workspaceGrid, state.tasks)
            : buildTraditionalCode(workspaceIds, state.tasks);

        //  Execute code via interpreter
        let interpreter1 = new (interpreter as any)(blocklist, undefined);
        interpreter1.run();
        let rawOutput = interpreter1.get_output().join('');
        const cleanOutput = rawOutput.replace(/\s+/g, '');
        const cleanExpected = problem?.answer.replace(/\s+/g, '') || "";
       
        setOutput(rawOutput === "[object Object]" ? "Invalid Output" : rawOutput);

        /* Jayla - Block checking logic for various Parsons types */
        if (problem?.type === "faded-parsons") {
            orderCorrect = hasMultipleOrders ? checkFadedOrderMultiple(workspaceIds, problem.correctOrders!) : checkFadedOrder(workspaceIds, problem?.correctOrder || []);
            referenceOrder = hasMultipleOrders ? (getMatchingFadedOrder(workspaceIds, problem.correctOrders!) || problem.correctOrders![0]) : (problem?.correctOrder || []);
            fadedAnswersCorrect = checkFadedAnswers(workspaceIds, state.tasks);
            setBlockColors(getFadedBlockColors(workspaceIds, referenceOrder));
            if (!fadedAnswersCorrect) {
                setResultStatus("incorrect");
                setFeedbackSummary(`One or more faded inputs are incorrect.`);
                openModal(); return;
            }
        } else if (problem?.type === "distractor") {
            orderCorrect = hasMultipleOrders ? checkDistractorOrderMultiple(workspaceIds, state.tasks, problem.correctOrders!) : checkDistractorOrder(workspaceIds, state.tasks, problem?.correctOrder || []);
            referenceOrder = hasMultipleOrders ? (getMatchingDistractorOrder(workspaceIds, state.tasks, problem.correctOrders!) || problem.correctOrders![0]) : (problem?.correctOrder || []);
            setBlockColors(getDistractorBlockColors(workspaceIds, state.tasks, referenceOrder));
      if (hasDistractorBlocks(workspaceIds, state.tasks)) {
                setResultStatus("incorrect");
                setFeedbackSummary(`You used distractor block(s). Remove them.`);
                openModal(); return;
            }
       } else if (problem?.type === "2d") {
                const gridComplete = checkTwoDComplete(workspaceGrid, state.tasks);
                const placementCorrect = checkTwoDPlacement(workspaceGrid, state.tasks);
                
                setBlockColors(getTwoDBlockColors(workspaceGrid, state.tasks));
                
                if (!gridComplete) {
                    setResultStatus("incorrect");
                    setFeedbackSummary("The 2D workspace is incomplete or some blocks are missing.");
                    openModal();
                    return;
                }

                orderCorrect = placementCorrect;
            } else {
            orderCorrect = hasMultipleOrders ? checkTraditionalOrderMultiple(workspaceIds, problem.correctOrders!) : checkTraditionalOrder(workspaceIds, problem?.correctOrder || []);
            referenceOrder = hasMultipleOrders ? (getMatchingCorrectOrder(workspaceIds, problem.correctOrders!) || problem.correctOrders![0]) : (problem?.correctOrder || []);
            setBlockColors(getTraditionalBlockColors(workspaceIds, referenceOrder));
        }

        //  Update feedback based on results
            const isCorrect =
            cleanOutput === cleanExpected && cleanOutput !== "" && orderCorrect;
            if(isCorrect)  { 
            setResultStatus("correct");
                    setFeedbackSummary("Correct order and output! Great job!");
                    setShowSuccessEffect(false); // Reset in case it's still true from a previous run
                    window.setTimeout(() => setShowSuccessEffect(true), 10);
                } else {
                    setResultStatus("incorrect");
                    setFeedbackSummary(!orderCorrect ? problem?.type === "2d" ? "Blocks are in the incorrect positions." : "Blocks are in the wrong order" : "Output does not match.");
                }

            try {
            await fetch("/api/progress", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                student_id: Number(localStorage.getItem("student_id")),
                module_slug: problem?.module,
                difficulty: problem?.difficulty,
                problem_number: Number(problem?.number),
                is_correct: isCorrect,
                }),
            });
            } catch (error) {
            console.error("Failed to update progress:", error);
            }
            openModal();
            };

            if (!hasMounted) return null;

    return (
        <ChakraProvider theme={theme}>
            <Flex flexDir="column" bg="main-bg" minH="100vh" w="full" color="white-text" pb="5rem">
                {/* Celebration animation */}
                 {showSuccessEffect && (
          // Shows success flash, text, and fireworks.
          <div className="fireworksLayer" aria-hidden="true">
            {/* Bright flash behind the celebration. */}
            <div className="successFlash"></div>
            {/* Large correct message in the middle of the screen. */}
            <div className="successBurstText">Correct!</div>
            {/* First firework burst*/}
            <div className="firework fireworkOne">
              {fireworkSparks.map((spark) => (
                // Each span is one spark ray inside the firework.
                <span key={`firework-1-${spark}`} className="fireworkSpark"></span>
              ))}
            </div>
            {/* Second firework burst. */}
            <div className="firework fireworkTwo">
              {fireworkSparks.map((spark) => (
                <span key={`firework-2-${spark}`} className="fireworkSpark"></span>
              ))}
            </div>
            {/* Third firework burst. */}
            <div className="firework fireworkThree">
              {fireworkSparks.map((spark) => (
                <span key={`firework-3-${spark}`} className="fireworkSpark"></span>
              ))}
            </div>
            {/* Fourth firework burst. */}
            <div className="firework fireworkFour">
              {fireworkSparks.map((spark) => (
                <span key={`firework-4-${spark}`} className="fireworkSpark"></span>
              ))}
            </div>
            {/* Fifth firework burst. */}
            <div className="firework fireworkFive">
              {fireworkSparks.map((spark) => (
                <span key={`firework-5-${spark}`} className="fireworkSpark"></span>
              ))}
            </div>
            {/* Sixth firework burst. */}
            <div className="firework fireworkSix">
              {fireworkSparks.map((spark) => (
                <span key={`firework-6-${spark}`} className="fireworkSpark"></span>
              ))}
            
            </div>
                   
                 </div>
                )}
                {/* Loading state handling */}
                {!hasMounted || isLoading ? (
                    <Flex flex="1" justify="center" align="center" flexDir="column">
                        <Spinner size="xl" color="blue.500" />
                        <Text mt="4">Loading Workspace...</Text>
                    </Flex>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div id="problem-workspace-wrapper">
                            <Flex py="4rem" flexDir="column" align="center">
                                <Heading fontSize="3xl">{problem?.number}. {problem?.name}</Heading>
                                <Text fontSize="20px" color="subtle-text" px="10" textAlign="center">{problem?.prompt}</Text>
                                <ChakraLink as={NextLink} href={`/problems?module=${moduleParam}&difficulty=${difficultyParam}`} color="blue.200">
                                    Click Here To Go To the Problem Page
                                </ChakraLink>
                            </Flex>

                            {/* Problem Workspace Columns */}
                            <Flex justify="center" w="100%" px="2rem">
                                <Box w="100%" maxW="1200px" border="2px solid #2f3a4f" borderRadius="md" p="4" bg="column-bg" display="flex" gap="2rem">
                                  {problem?.type === "2d" ? (
                                        <>
                                            <Box flex="1" minW="0" display="flex">
                                                <Column
                                                    column={state.columns["1"]}
                                                    tasks={state.columns["1"].taskIds.map((id) => state.tasks[id]).filter(Boolean) || []}
                                                    blockColors={blockColors}
                                                    onFadedInputChange={handleFadedInputChange}
                                                    problemType={problem?.type}
                                                    isModalOpen={isModalOpen}
                                                />
                                            </Box>

                                            <Box flex="1" minW="0" display="flex">
                                                <TwoDWorkspace
                                                    workspaceGrid={workspaceGrid}
                                                    tasks={state.tasks}
                                                    gridColumns={problem?.gridColumns || 4}
                                                    //onRemove={handleRemoveFromGrid}
                                                    blockColors={blockColors}
                                                    isModalOpen={isModalOpen}
                                                />
                                            </Box>
                                        </>
                                    ): (
                                        state.columnOrder.map((columnId) => {
                                            const column = state.columns[columnId];
                                            const tasks = column.taskIds.map((id) => state.tasks[id]);

                                            return (
                                                <Column
                                                    key={column.id}
                                                    column={column}
                                                    tasks={tasks.filter(Boolean)}
                                                    blockColors={blockColors}
                                                    onFadedInputChange={handleFadedInputChange}
                                                    
                                                    problemType={problem?.type}
                                                    isModalOpen={isModalOpen}
                                                />
                                            );
                                        })
                                    )}
                                    {/* {state.columnOrder.map((columnId) => {
                                        const column = state.columns[columnId];
                                        const tasks = column.taskIds.map((id) => state.tasks[id]);
                                        return <Column key={column.id} column={column} tasks={tasks} blockColors={blockColors} onFadedInputChange={handleFadedInputChange} />;
                                    })}
                                    })} */}
                                </Box>
                            </Flex>
                            
                            {/*  Control Buttons */}
                            <div className="container">
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                                  
                                    <button type="button" className="buttonRefresh" onClick={refresh}>Refresh</button>
                                  <button type="button" 
                                        className="buttonHint" 
                                        onClick={hint}
                                        style={{ 
                                            opacity: runCount < 2 ? 0.5 : 1, 
                                            cursor: runCount < 2 ? "not-allowed" : "pointer" 
                                        }}
                                        
                                    >
                                        Hint {runCount < 2 && `(${runCount}/2)`}
                                    </button>
                                     <button type="button" className="buttonRun" onClick={run}>Run</button>
                                </div>
                                
                                {/*  Feedback Modal */}
                               <ModalComponent isOpen= {isModalOpen} onRequestClose={closeModal} >
                            
                                    <div className="modalHeader">
                                        <h2>Your Output: {running}</h2>
                                    </div>

                                    {/* Using resultStatus instead of feedback.status fixes the thumbs down bug */}
                                    <div className={`${resultStatus === "correct" ? "modalStatusCorrect" : "modalStatusIncorrect"} ${resultStatus === "correct" && showSuccessEffect ? "modalStatusCelebrate" : ""}`}>
                                        <p>
                                            <span className={`${resultStatus === "correct" && showSuccessEffect ? "modalThumb modalThumbCelebrate" : "modalThumb"}`} aria-hidden="true">
                                                {resultStatus === "correct" ? "👍" : "👎"}
                                            </span>
                                            {resultStatus === "correct" ? "Correct" : "Incorrect"}
                                        </p>
                                    </div>

                                    {/* The dynamic explanation of what went wrong (or right) */}
                                    <div className="modalSummary">
                                        <p>{feedbackSummary}</p>
                                    </div>

                                    {/* The explicit expected output */}
                                    <div className="modalTextAnswer">
                                        <p>Expected Output = {problem?.answer}</p>
                                    </div>

                                    <div className="modalTextEscape">
                                        <button onClick={closeModal}>Return to Editor</button>
                                    </div>
                             
                                </ModalComponent>
                            {/* New modal component for the hint button warning */}
                                <ModalComponent isOpen={showWarningModal} onRequestClose={() => setShowWarningModal(false)}>
                                  
                                   <div className="modalHeader">
                                        <h2 style={{ color: 'white' }}>Hint Unavailable</h2>
                                    </div>

                                    <div className="modalSummary">
                                        <p>You must run your code {2 - runCount} more time(s) before accessing hints.</p>
                                    </div>

                                    <div className="modalTextEscape">
                                        <button onClick={() => setShowWarningModal(false)}>Got it</button>
                                    </div>
                                
                                </ModalComponent>
                            </div>
                        </div>
                    </DragDropContext>
                    )}
                </Flex>
                    {/*  Milo Assistant Integration */}
                    <MiloAssistant 
                        isOpen={isMiloOpen} 
                        onClose={() => setIsMiloOpen(false)} 
                        problemContext={problem} 
                        currentCode={state.columns['2']?.taskIds.map(id => state.tasks[id].content).join('\n') || ''} 
                    />
                    
                </ChakraProvider>
            );
        }

/*
Purpose:
This page displays the individual programming problem workspace.
It supports drag-and-drop Parsons problems, faded Parsons, distractor blocks,
Milo hints, success fireworks, modal feedback, and Supabase progress tracking.
*/