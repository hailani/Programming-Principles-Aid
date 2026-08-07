"use client";
import {Flex, Text} from "@chakra-ui/react";
import React from "react";
import Link from "next/link";

const NavBar = ({ variant }) => {
    const navColors = {
        default: "#8638da",
        modules: "#453ed2",
        problems: "#312e81",
        workspace: "#27c262"
    }
    const bgColor = navColors[variant] || navColors.default;
    return (
        <Flex
            w="100%"
            bg={bgColor}
            color="black"
            px="2.5rem"
            py="1.4rem"
            justify="space-between"
            align="center"
            borderBottom="2px solid #334155"
            // borderRadius = "0 0 15px 15px"
            boxShadow="0 8px 20px rgba(0, 0, 0, 0.35)"
            // mb = "2rem"
        >
            <Flex gap="1.5rem" align = "center">
                <Link href = "/">
                <Text fontWeight = "bold" fontSize="lg" cursor="pointer" _hover={{color: "blue.100"}} transition="0.2s">
                    {"</>"}
                </Text>
                </Link> 
            </Flex>
            
            <Flex gap = "3rem" align="center">
                <Link href="/modules">
                <Text fontWeight = "bold" fontSize="lg" cursor = "pointer" _hover={{ color: "blue.100" }} transition="0.2s">Modules</Text>
                </Link>
                <Text fontWeight = "bold" fontSize="lg" cursor = "pointer" _hover={{ color: "blue.100" }} transition="0.2s">Log Out </Text>
            </Flex>
        </Flex>
    );
};

export default NavBar;

/* Jayla -
"use client" - ensure this component runs on the client side; required because Chakra UI components rely on client-side rendering.
line 5:const NavBar = () => NavBar component that appears at the tope of the page; contains the application logo links
line 16: Left side = Logo area
line 21: Right side = navagation links
line 29: exports the NavBar component so it can be used in other files

Purpose - 
    Creates the main navigation bar displayed at the top of the
    application-
    Provides quick access to important sections such as the Modules page and the Log Out functionality-
    Built using Chakra UI'sFlex component to align items horizontally and maintain consistent spacing and styling across the interface-
*/