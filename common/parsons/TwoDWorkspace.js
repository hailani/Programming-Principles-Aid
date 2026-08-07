import React from "react";
import {Box, Text, Flex} from "@chakra-ui/react";
import {Droppable, Draggable} from "react-beautiful-dnd";

const ROW_HEIGHT = 74;
const INDENT_WIDTH = 46;

const TwoDWorkspace =({
    workspaceGrid,
    tasks,
    gridColumns = 5,
    blockColors = {},
    isModalOpen
}) => {
    const rowCount = workspaceGrid.length;

    return (
        <Box
            rounded="10px"
            overflow="hidden"
            bg="columnBg"
            w="100%"
            minH="900px"
            flexDir = "column"
            border="1px solid"
            borderColor="cardBorder"
        >
            {/*Header*/}
            <Flex align="center" h="60px" bg="columnHeaderBg" px="1.5rem">
                <Text fontSize="lg" fontWeight="bold" color="whiteText">
                    WorkSpace
                </Text>
            </Flex>

            {/*Grid Area*/}
            <Box
                position="relative"
                p="1.5rem"
                borderTop="1px solid"
                borderColor="cardBorder"
                minH={`${Math.max(520, rowCount * ROW_HEIGHT + 48)}px`}
            >
                {/*Vertical indentention guide lines*/}
                {Array.from({ length: gridColumns + 1}).map((_, colIndex) => (
                    <Box
                        key={`line-${colIndex}`}
                        position="absolute"
                        top="1.5rem"
                        bottom="1.5rem"
                        left={`calc(1.5rem + ${colIndex * INDENT_WIDTH}px)`}
                        w="1px"
                        bg="yellow.300"
                        opacity={0.55}
                        pointerEvents="none"
                    />
                ))}

                {/* Droppable cells*/}
                {workspaceGrid.map((row, rowIndex) =>
                    row.map((cellTaskId, colIndex) =>  {
                        const droppableId = `grid-${rowIndex}-${colIndex}`;
                        const task = cellTaskId ? tasks[cellTaskId] : null;
                        const taskContent = 
                            typeof task === "string" ? task : task?.content || "";

                        const blockColor = cellTaskId ? blockColors[String(cellTaskId)] : undefined;
                        const blockBackground =
                            blockColor === "correct"
                            ? "#c5f2d0"
                            :blockColor === "incorrect"
                            ? "#f5c6ca"
                            :"#1e293b";

                        const blockTextColor =
                            blockColor === "correct"
                            ? "#1a6927"
                            : blockColor === "incorrect"
                            ? "#8b1e2d"
                            : "#ffffff";

                        const blockBorderColor =
                            blockColor === "correct"
                            ? "#22c55e"
                            : blockColor === "incorrect"
                            ? "#ef4444"
                            : "#ffffff";

                        return (
                            <Droppable key={droppableId} droppableId={droppableId}>
                                {(droppableProvided, droppableSnapshot) => (
                                    <Box
                                        ref={droppableProvided.innerRef}
                                        {...droppableProvided.droppableProps}
                                        position="absolute"
                                        top={`${24 + rowIndex * ROW_HEIGHT}px`}
                                        left={`${24 + colIndex * INDENT_WIDTH}px`}
                                        h={`${ROW_HEIGHT - 10}px`}
                                        w={`calc(100% - ${48 + colIndex * INDENT_WIDTH}px)`}
                                        zIndex={ task ? 20 : 1}
                                        border="1px dashed"
                                        borderColor={
                                            droppableSnapshot.isDraggingOver
                                                ? "yellow.300"
                                                : task
                                                ? "transparent"
                                                : "gray.500"
                                        }
                                        bg={task ? "transparent" : droppableSnapshot.isDraggingOver ? "yellow.200" : "transparent"}
                                        opacity={task ? 1 : droppableSnapshot.isDraggingOver ? 0.45 : 0}
                                        borderRadius="md"
                                        overflow="hidden"
                                    >

                                        {/*Draggrable block */}
                                        {task && (
                                            <Draggable draggableId={String(task.id)} index={0} isDragDisabled={isModalOpen}>
                                                {(draggableProvided, draggableSnapshot) => (
                                                    <Box
                                                        ref={draggableProvided.innerRef}
                                                        {...draggableProvided.draggableProps}
                                                        {...draggableProvided.dragHandleProps}
                                                        minH="56px"
                                                        bg={blockBackground}
                                                        color={blockTextColor}
                                                        border="2px solid"
                                                        borderColor={blockBorderColor}
                                                        borderRadius="8px"
                                                        px="1rem"
                                                        py="0.85rem"
                                                        boxShadow={ draggableSnapshot.isDragging ? "0 6px 14px rgba(0,0,0,0.5)" : "0 4px 10px rgba(0,0,0,.35)"}
                                                        cursor={draggableSnapshot.isDragging ? "grabbing" : "grab"}
                                                        position="relative"
                                                        zIndex={999}
                                                        userSelect="none"
                                                    >
                                                        <Text fontSize="14px" fontWeight="600" whiteSpace="pre-wrap" wordBreak="break-word">
                                                            {taskContent}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Draggable>
                                        )}

                                        {droppableProvided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        );
                    })
                )}
            </Box>
        </Box>
    );
};

export default TwoDWorkspace;