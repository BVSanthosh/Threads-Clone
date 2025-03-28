import { Avatar, Box, Flex, Text, Skeleton, Image } from "@chakra-ui/react";
import { selectedContactAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ message, ownMessage }) => {
    const selectedContact = useRecoilValue(selectedContactAtom);
    const user = useRecoilValue(userAtom);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <>
            {ownMessage ? (
                <Flex gap={2} alignSelf={"flex-end"}>
                    {message.text && (
                        <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"} alignItems="center">
                            <Text color={"white"}>
                                {message.text}
                            </Text>
                            <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : "white"} fontWeight={"bold"}>
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}

                    {message.img && (
                        <Flex mt={5} w={"200px"} position="relative">
                            {!imageLoaded && <Skeleton w={"200px"} h={"200px"} position="absolute" />}
                            <Image 
                                src={message.img}
                                alt="Message image"
                                borderRadius={4}
                                display={imageLoaded ? "block" : "none"}
                                onLoad={() => setImageLoaded(true)}
                            />
                        </Flex>
                    )}

                    <Avatar src={user.profilePic} w="7" h="7" />
                </Flex>
            ) : (
                <Flex gap={2}>
                    <Avatar src={selectedContact.profilePic} w="7" h="7" />
                    
                    {message.text && (
                        <Text maxW={"350px"} bg={"gray.400"} p={1} borderRadius={"md"} color={"black"}>
                            {message.text}
                        </Text>
                    )}

                    {message.img && (
                        <Flex mt={5} w={"200px"} position="relative">
                            {!imageLoaded && <Skeleton w={"200px"} h={"200px"} position="absolute" />}
                            <Image 
                                src={message.img}
                                alt="Message image"
                                borderRadius={4}
                                display={imageLoaded ? "block" : "none"}
                                onLoad={() => setImageLoaded(true)}
                            />
                        </Flex>
                    )}
                </Flex>
            )}
        </>
    );
};

export default Message;
