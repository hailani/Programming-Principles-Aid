import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Droppable } from "react-beautiful-dnd";
import { Input } from '@chakra-ui/react'

const Column = ({ column, tasks, blockColors = {}, onFadedInputChange, problemType, isModalOpen}) => {
  if (!column) return null;

  return (
    <Flex rounded="10px" overflow="hidden" bg="columnBg" w="100%" flex="1" minH="900px" maxH="900px" flexDir="column" border="1px solid" borderColor="cardBorder">
      <Flex
        align="center"
        h="60px"
        bg="columnHeaderBg"
        px="1.5rem"
        pl="1.75rem"
        pr="1.25rem"
      >
        <Text fontSize="lg" fontWeight="bold" color="whiteText">
          {column.title}
        </Text>
      </Flex>

      <Droppable droppableId={column.id}>
        {(droppableProvided, droppableSnapshot) => (
          <Flex
            px="1.5rem"
            pt="1.5rem"
            pb="1.5rem"
            flex={1}
            flexDir="column"
            overflowY="auto"
            overscrollBehavior="contain"
            scrollBehavior="smooth"
            color="subtleText"
            borderTop="1px solid"
            borderColor="cardBorder"
            sx={{ scrollbarGutter: "stable both-edges" }}
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            {tasks.filter(Boolean).map((task, index) => {
              const taskContent = typeof task?.content === "string" ? task.content : "";
              const blockColor = column.id === "2" ? blockColors[String(task.id)] : undefined;
              const blockBackground =
                blockColor === "correct"
                  ? "#c5f2d0"
                  : blockColor === "incorrect"
                    ? "#f5c6ca"
                    : "card-bg";
              const blockTextColor =
                blockColor === "correct"
                  ? "#1a6927"
                  : blockColor === "incorrect"
                    ? "#8b1e2d"
                    : "inherit";
              
              const isWorkSpace = column.id === "2";
              const isFadedTask = !!task?.isFaded && task.content.includes("__BLANK__");

              const isWrongFaded = 
                !!task?.isFaded &&
                !!task?.userAnswer &&
                !!task?.correctAnswer &&
                task.userAnswer.trim() !== task.correctAnswer.trim();

              const is2DCodeBank = 
                problemType === "2d" && column.id === "1";

              return (
                <Draggable 
                  key={String(task?.id ?? index)}
                  draggableId={String(task?.id ?? index)}
                  index={index}
                  isDragDisabled={isModalOpen}
                >
                  {(draggableProvided, draggableSnapshot) => (
                    <Flex
                      mb="1rem"
                      minH="60px"
                      w="100%"
                      overflow="hidden"
                      wordBreak="breakWord"
                      bg={blockBackground}
                      rounded="3px"
                      p="1.5rem"
                    /* MERGED: Using Border from Incoming for consistent UI */
                      border="2px solid"
                      borderColor="card-border"
                      outline="2px solid"
                      boxSizing="border-box"
                      boxShadow={
                        draggableSnapshot.isDragging
                          ? "0 5px 10px rgba(0, 0, 0, 0.6)"
                          : "unset"
                      }
                      outlineColor={
                        draggableSnapshot.isDragging ? "card-border" : "transparent"
                      }
                      // border={
                      //   selectedTaskId === String(task?.id) ? "3px solid #22c55e" : "2px solid transparent"
                      // }
                      cursor= "grab"
                      
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...(draggableProvided.dragHandleProps)}
                  >
                    {isFadedTask && isWorkSpace ? (
                      <Text color={blockTextColor}>
                        {task.content.split("__BLANK__")[0]}
                        <Input
                          display = "inline-block"
                          width="90px"
                          mx="2"
                          size="sm"
                          value={task.userAnswer || ""}
                          onChange={(e) => onFadedInputChange?.(String(task.id), e.target.value)}
                          verticalAlign="middle"
                          bg={isWrongFaded ? "#e7b6b6" : "white"}
                          color="black"
                          borderColor={isWrongFaded ? "red.400" : "gray.200"}
                        />
                        {task.content.split("__BLANK__")[1]}
                      </Text>
                    ) : (
                    <Text color={blockTextColor}>
                      {task.content.replace("__BLANK__", "____")}
                    </Text>)}
                  </Flex>
                )}
              </Draggable>
              );
            })}
            {droppableProvided.placeholder}
          </Flex>
        )}
      </Droppable>
    </Flex>
  );
};

export default Column;