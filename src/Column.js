import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Droppable } from "react-beautiful-dnd";

const Column = ({ column, tasks }) => { //Jayla - Column = information about the column (id + title) and Tasks = an array of task inside that specific column//
  return ( //Jayla - Line 8: creates the column box with the properties (rounded = rounded corners, bg = background color, w = width, h = height, flexDir = vertical layout)//
    <Flex rounded="10px" bg="columnBg" flex="1" w="100%" minH="600px" flexDir="column" border="1px solid" borderColor="card-border"> 
      <Flex //Jayla = lines 10-12 displays the column title
        align="center"
        h="60px"
        bg="column-header-bg"
        rounded="10px 10px 0 0" //Jayla - previous measurements: 3px 3px 0 0
        px="1.5rem"
        mb="1.5rem"
      >
        <Text fontSize="lg" fontWeight="bold" color="whiteText">
          {column.title}
        </Text>
      </Flex>
      <Droppable droppableId={column.id}>
        {(droppableProvided, droppableSnapshot) => (
          <Flex
            px="1.5rem"
            flex={1}
            flexDir="column"
            borderColor="workspace-border"
            rounded="10px"
            align="center"
            justify="center"
            color="subtle-text"
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={`${task.id}`} index={index}>
                {(draggableProvided, draggableSnapshot) => (
                  <Flex //Jayla - Lines 34 - 37 creates the code of blocks
                    mb="1rem" //Jayla - previous measurement: 1rem
                    minH="60px"
                    w="100%"
                    overflow="hidden"
                    wordBreak="break-word"
                    bg="cardBg"
                    rounded="8px"
                    align="center"
                    p="1.5rem" //Jayla - previous measurement: 1.5rem, (3/24/2026) previous measurement: 1rem
                    boxSizing="border-box"
                    outline="2px solid"
                    outlineColor={
                      draggableSnapshot.isDragging
                        ? "card-border"
                        : "transparent"
                    }
                    boxShadow={
                      draggableSnapshot.isDragging
                        ? "0 5px 10px rgba(0, 0, 0, 0.6)"
                        : "unset"
                    } //Jayla - Lines 45 - 49 makes the code block have a shadow and border when being dragged, and removes it when not being dragged//
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    <Text w="100%" whiteSpace="pre" overflowX="auto"> {task.content}</Text>
                  </Flex>
                )}
              </Draggable>
            ))}
          </Flex>
        )}
      </Droppable>
    </Flex>
  );
};

export default Column; //Jayla - Allows other files to import the Column component, which is used in index.js to display the columns on the page//

/* Jayla - 
px = padding on the x-axis (left and right)
py = padding on the y-axis (top and bottom)
mb = margin bottom
outline = border around the code block when being dragged
boxShadow = shadow around the code block when being dragged
flex = 1 means the column will take up equal space as other columns
flexDir = "column" means the content inside the column will be arranged vertically
outlineColor = changes the color of the outline when being dragged
p = padding on all sides
ref = reference to the DOM element for drag and drop functionality
lg = large font size
*/