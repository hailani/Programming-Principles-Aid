"use client";

import { ChakraProvider } from "@chakra-ui/react";
import React from "react";

export function Providers ({ children }: { children:React.ReactNode }) {
    return <ChakraProvider>
        {children}
    </ChakraProvider>;
}

/* Purpose:
    Wraps the application with ChakraProvider,
    allowing all child componenets to access Chakra UI's
    styling system, themes, and design utilities.
    Ensures consistent styling across and UI behavior across the entire application
*/
