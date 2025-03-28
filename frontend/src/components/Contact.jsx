import { Avatar, AvatarBadge, Flex, Stack, useColorModeValue, WrapItem, Text, Image, useColorMode, Box } from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom.js";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedContactAtom } from "../atoms/messagesAtom.js";

const Contact = ({ contact, isOnline }) => {
    const currentUser = useRecoilValue(userAtom);
    const [selectedContact, setSelectedContact] = useRecoilState(selectedContactAtom);
    const user = contact.participants[0];
    const lastMessage = contact.lastMessage;
    const colorMode = useColorMode();

    return (
        <Flex 
            gap={4}
            alignItems={"center"}
            p={"1"} 
            _hover={{
                cursor: "pointer",
                bg: useColorModeValue("gray.600", "gray.dark"),
                color: "white"
            }} 
            borderRadius={"md"}
            bg={selectedContact?.id === contact._id ? (colorMode === "light" ? "gray.600" : "gray.dark") : ""}
            onClick={() => setSelectedContact({
                _id: contact._id,
                userId: user._id,
                username: user.username,
                profilePic: user.profilePic,
                mock: contact.mock,
            })}
        >
            <WrapItem>
                <Avatar
                    size={{
                        base: "xs",
                        sm: "sm",
                        md: "md"
                    }} 
                    src={user.profilePic}
                >
                    {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
                </Avatar>
            </WrapItem>
            <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight="700" display={"flex"} alignItems={"center"}>
                    {user.username} <Image src="/verified.png" w={4} h={4} ml={1} />
                </Text>
                <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
                    {currentUser._id === lastMessage.sender ? (
                        <Box color={lastMessage.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : ""}
                    {lastMessage.text.length > 18 ? lastMessage.text.substring(0, 18) + "..." : lastMessage.text || <BsFillImageFill size={16} />}
                </Text>
            </Stack>
        </Flex>
    )
}

export default Contact;