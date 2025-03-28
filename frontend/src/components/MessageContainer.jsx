import { Avatar, Flex, useColorModeValue, Image, Text, Divider, SkeletonCircle, Skeleton } from "@chakra-ui/react";
import Message from "./Message.jsx";
import MessageInput from "./MessageInput.jsx";
import { useEffect, useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast.js";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { contactsAtom, selectedContactAtom } from "../atoms/messagesAtom.js";
import userAtom from "../atoms/userAtom.js";
import {useSocket} from "../context/SocketContext.jsx";
import messageSound from "../assets/sounds/message.mp3";

const MessageContainers = () => {
  const currentUser = useRecoilValue(userAtom);
  const selectedContact = useRecoilValue(selectedContactAtom);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const setContacts = useSetRecoilState(contactsAtom)
  const {socket} = useSocket();
  const messageRef = useRef();
  const showToast = useShowToast();

  useEffect(() => { 
    socket.on("newMessage", (message) => {

      if (selectedContact._id === message.conversationId) {
        setMessages(prevMessages => [...prevMessages, message]);
      }

      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      setContacts((prevContacts) => {
        const updatedContacts = prevContacts.map(contact => {
          if (contact._id === message.conversationId) {
            return {
              ...contact,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              }
            }
          }

          return contact;
        });

        return updatedContacts;
      })
    });

    return () => socket.off("newMessage");
  }, [socket, selectedContact, setContacts]);

  useEffect(() => {
    const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) { 
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedContact._id,
        userId: selectedContact.userId,
      })
    }

    socket.on("messagesSeen", ({conversationId}) => {
      if (selectedContact._id === conversationId) {
        setMessages(prevMessages => {
          const updatedMessages = prevMessages.map(message => {
            if (!message.seen) {
              return {
                ...message,
                lastMessage: true,
              };
            }
  
            return message;
          });

          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser._id, messages, selectedContact]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);

      try {
        if (selectedContact.mock) return;

        const res = await fetch(`/api/messages/${selectedContact.userId}`);
        const data = await res.json();

        if (data.error) {
          showToast("Error", error.message, "error");
          return;
        }

        setMessages(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingMessages(false);
      }
    }

    getMessages();
  }, [showToast, selectedContact.userId, selectedContact.mock]);

  return (
    <Flex
      flex="70"
      bg={useColorModeValue("gray.200", "gray.dark")}
      flexDir={"column"}
      p={2}
    >
      <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        <Avatar src={selectedContact.profilePic} size={"sm"} />
        <Text display={"Flex"} alignItems={"center"}>
          {selectedContact.username} <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
      </Flex>
      <Divider />
      <Flex
        flexDir={"column"} 
        gap={4}
        my={4}
        h={"400px"}  
        overflowY={"auto"}
        p={2}
      >
        {loadingMessages && (
          [...Array(5)].map((_, i) => (
            <Flex key={i} gap={2} alignItems={"center"} p={1} borderRadius={"md"} alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}>
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir={"column"} gap={2}>
                <Skeleton h={"8px"} w={"250px"}/>
                <Skeleton h={"8px"} w={"250px"}/>
                <Skeleton h={"8px"} w={"250px"}/>
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))
        )}
 
        {messages.map((message) => (
          <Flex key={message._id} direction={"column"} ref={message.length === messages.indexOf(message) ? messageRef : null}>
            <Message key={message._id} message={message} ownMessage={currentUser._id === message.sender} />
          </Flex>
        ))}
      </Flex>
      <MessageInput setMessages={setMessages}/>
    </Flex>
  )
}

export default MessageContainers;