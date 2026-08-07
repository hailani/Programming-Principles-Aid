import { Flex, Heading, Text } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";


const Column = dynamic(() => import("../src/Main_Column"), { ssr: false }); //Jayla - Loads the Column component dynamically, which is used to display the columns on the page. The "ssr: false" option ensures that the component is only rendered on the client side, preventing any server-side rendering issues.

const reorderColumnList = (sourceCol, startIndex, endIndex) => { //Jayla - reordering inside the same column
  const newTaskIds = Array.from(sourceCol.taskIds);
  const [removed] = newTaskIds.splice(startIndex, 1);
  newTaskIds.splice(endIndex, 0, removed);

  const newColumn = { //Jayla - updates the order inside the column
    ...sourceCol,
    taskIds: newTaskIds,
  };

  return newColumn;
};

export default function Home() {
  const [state, setState] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source } = result;

    // If user tries to drop in an unknown destination
    if (!destination) return;

    // if the user drags and drops back in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If the user drops within the same column but in a different positoin
    const sourceCol = state.columns[source.droppableId];
    const destinationCol = state.columns[destination.droppableId];

    if (sourceCol.id === destinationCol.id) { //Jayla - Moving inside the same column
      const newColumn = reorderColumnList(
        sourceCol,
        source.index,
        destination.index
      );

      const newState = { //Jayla - Update
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      };
      setState(newState);
      return;
    }

    // If the user moves from one column to another
    const startTaskIds = Array.from(sourceCol.taskIds);
    const [removed] = startTaskIds.splice(source.index, 1);
    const newStartCol = {
      ...sourceCol,
      taskIds: startTaskIds,
    };

    const endTaskIds = Array.from(destinationCol.taskIds);
    endTaskIds.splice(destination.index, 0, removed);
    const newEndCol = {
      ...destinationCol,
      taskIds: endTaskIds,
    };

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol,
      },
    };

    setState(newState);
  };

  //Jayla - Line 89: enabling the drag and drop
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex flexDir="column" px = "2rem" pt = "2rem">
        <Flex
          border = "2px solid white"
          borderRadius = "15px"
          py = "1.5rem"
          justify="center"
          mb = "2rem"
        >
          <Text fontSize="2xl" fontWeight = "bold">
            {problem?.name}
          </Text>

          <Text mt="0.5rem" color="subtleText" textAlign="center" maxW="700px">
            {problem?.prompt}
          </Text>
        </Flex>
      </Flex>
      <Flex
        flexDir="column" //Jayla - creates the main page layout
        bg="mainBg"
        minH="100vh" //Jayla - minimum height = full screen
        w="full"
        color="whiteText" //Jayla - default text color
        pb="2rem" //Jayla - padding bottom
      >
        <Flex py="4rem" flexDir="column" align="center">
          <Heading fontSize="3xl" fontWeight={600}>
            Programming Principle Aid 
          </Heading>
          <Text fontSize="20px" fontWeight={600} color="subtleText">
          
          </Text>
        </Flex>

        <Flex justify="space-between" px="1rem">
          {state.columnOrder.map((columnId) => {
            const column = state.columns[columnId];
            const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </Flex>
      </Flex>
    </DragDropContext>
  );
}

/*Jayla - 
  Line 98 = header area of where the title appears
  Line 107 = holds all the columns
  rem = Root EM, which is a unit of measurement in CSS. Scales with the root font size.
  example: 1rem = 16px, so 4rem = 64px
  px = padding left and right
  py = padding top and bottom
  mb = margin bottom
  p = padding on all sides
  minH = minimum height
  w = width
  pb = padding bottom
  pt = padding top
  bg = background color
  flexDir = flex direction (column = vertical, row = horizontal)
  justify = justify content (center, space-between, etc.)
  align = align items (center, flex-start, etc.)
  mt = margin top
  maxW = maximum width
  color = text color
  fontSize = font size
  fontWeight = font weight (bold, normal, etc.)
  border = border properties (e.g. "2px solid white")
  borderRadius = border radius (e.g. "15px")
*/

const initialData = {
  tasks: {
    1: { id: 1, content: "String x = ;" },
    2: { id: 2, content: "Int x = ;" },
    3: { id: 3, content: "double x = ;" },
    4: { id: 4, content: "public static void Main(String[] args){" },
    5: { id: 5, content: "}" },
    6: { id: 6, content: "System.out.Print(x);" },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "Code Bank",  //Jayla - Affects the text of the Columns//
      taskIds: [1, 2, 3, 4, 5, 6],
    },
    "column-2": {
      id: "column-2",
      title: "WorkSpace",
      taskIds: [],
    },
  
  },
  // Facilitate reordering of the columns
  columnOrder: ["column-1", "column-2"],
};
