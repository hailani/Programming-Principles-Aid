"use client";

import { useState, useEffect } from "react";
import { Box, IconButton, Flex, Text, Input, VStack, Spinner } from "@chakra-ui/react";
import { ChatIcon, CloseIcon} from "@chakra-ui/icons";
import axios from "axios";
import { CardResponseType } from "@/common/types/CardResponseType";
import { FaPaperPlane } from "react-icons/fa";

interface MiloProps {
    isOpen: boolean;
    onClose: () => void;
    problemContext?: CardResponseType;
    currentCode: string;
}

const MiloAssistant = ({ isOpen, onClose, problemContext, currentCode }: MiloProps) => {
    const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    
    //  Track if the Hint button has ever been pressed
    const [hasBeenTriggered, setHasBeenTriggered] = useState(false);

    //  This watches for the isOpen prop to change. Once it opens, set triggered to true permanently.
    useEffect(() => {
        if (isOpen) {
            setHasBeenTriggered(true);
        }
    }, [isOpen]);
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ sender: "Milo", text: "Hi! I'm Milo. Do you need a hint with this problem?" }]);
        }
    }, [isOpen, messages.length]);

    const sendMessage = async () => {
        if (input.trim() === "") return;
        
        const userText = input;
        setMessages((prev) => [...prev, { sender: "You", text: userText }]);
        setInput("");
        setIsThinking(true); 

        try {
            const res = await axios.post('/api/ollamaChat', {
                userMessage: userText,
                problemName: problemContext?.name || "Unknown",
                problemPrompt: problemContext?.prompt || "Unknown",
                problemAnswer: problemContext?.answer || "Unknown",
                studentCode: currentCode 
            });
            
            setMessages((prev) => [...prev, { sender: "Milo", text: res.data.response }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { sender: "Milo", text: "Sorry, my brain disconnected. Check the VS Code terminal for errors!" }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
        {hasBeenTriggered && (
                <IconButton
                    icon={isOpen ? <CloseIcon /> : <ChatIcon />}
                    position="fixed"
                    bottom="3rem"
                    left="3rem"
                    zIndex={10000}
                    colorScheme="green"
                    borderRadius="full"
                    boxShadow="lg"
                    onClick={onClose}
                    aria-label="Toggle Milo Assistant"
                />
            )}

            {isOpen && (
                <Box
                    position="fixed"
                    bottom="7rem"
                    left="3rem"
                    w="450px"
                    h="550px" 
                    bg="black"
                    zIndex={9999}
                    shadow="lg"
                    borderRadius="xl"
                    p="0"
                    display="flex"
                    flexDirection="column"
                    border="2px solid"
                    borderColor="green.400"
                    boxShadow="0 0 12px #39ff14"
                >
                    <Flex
                        bg="green.700"
                        w="100%"
                        px="4"
                        py="3"
                        borderTopRadius="xl"
                        align="center"
                        justify="space-between"
                    >
                        <Text
                            textAlign="center"
                            fontWeight="900"
                            fontSize="2xl"
                            fontStyle="italic"
                            color="white"
                            flex="1"
                        >
                            MILO AI ⚡
                        </Text>

                    </Flex>
                    <VStack spacing="1" flex="2" overflowY="auto" mb="2" mt="3" px="3" align="stretch">
                        {messages.map((msg, index) => (
                            <Box 
                                key={index}
                                maxW="85%"
                                alignSelf={msg.sender === "You" ? "flex-end" : "flex-start"}
                                >
                                  {msg.sender === "Milo" && (
                                    <Text color="green.400" fontWeight="bold" mb="1">
                                    MILO AI ⚡
                                    </Text>
                                )}
                                <Box
                                bg={msg.sender === "You" ? "orange.400" : "green.900"}
                                color="white"
                                px="3"
                                py="2"
                                borderRadius="20px" 
                                fontSize="sm"
                                >
                                  {msg.text}  
                                </Box>
                            </Box>
                        ))}
                        {isThinking && (
                            <Box bg="green.900" color="white" px="3" py="2" borderRadius="md" maxW="85%" alignSelf="flex-start">
                                <Spinner size="sm" /> Thinking...
                            </Box>
                        )}
                    </VStack>
                    <Box position="relative" mt = {2} px="3" py="2" borderTop="1px solid" borderColor="green.400" display="flex">
                        <Input
                            placeholder="Ask for a hint..."
                            value={input}
                            size="sm"
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={isThinking}
                            borderColor="green.400"
                            pr = "56px"
                            borderRadius = "full"
                            
                            
                        />
                        <IconButton
                            icon={<FaPaperPlane />}
                            colorScheme="green"
                            size="sm"
                            onClick={sendMessage}
                            aria-label="Send Message"
                            isLoading={isThinking}
                            position="absolute"
                            right="13px"
                            top="50%"
                            transform="translateY(-50%)"
                            borderColor="green.400"
                            borderRadius = "full"
                        />
                    </Box>
                </Box>
            )}
        </>
    );
};

export default MiloAssistant;