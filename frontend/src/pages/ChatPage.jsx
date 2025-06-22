import { SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, useColorModeValue, Text } from "@chakra-ui/react";
import Contact from "../components/Contact.jsx";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer.jsx";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { contactsAtom, selectedContactAtom } from "../atoms/messagesAtom.js";
import userAtom from "../atoms/userAtom.js";
import { useSocket } from "../context/SocketContext.jsx";
import axiosInstance from "../lib/axios";

const ChatPage = () => {
  const showToast = useShowToast();
  const [contacts, setContacts] = useRecoilState(contactsAtom);
  const [selectedContact, setSelectedContact] = useRecoilState(selectedContactAtom);
  const currentUser = useRecoilValue(userAtom);
  const [searchText, setSearchText] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    const handleMessageSeen = ({ conversationId }) => {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === conversationId
            ? { ...contact, lastMessage: { ...contact.lastMessage, seen: true } }
            : contact
        )
      );
    };

    socket?.on("messageSeen", handleMessageSeen);

    return () => {
      socket?.off("messageSeen", handleMessageSeen);
    };
  }, [socket, setContacts]);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const { data } = await axiosInstance.get("/messages/conversations");

        setContacts(data);
      } catch (error) {
        showToast("Error", error.response?.data?.error?.message || error.message, "error");
      } finally {
        setLoadingContacts(false);
      }
    };

    getContacts();
  }, [showToast, setContacts]);

  const handleSearch = async (e) => {
    e.preventDefault();

    setSearchingUser(true);

    try {
      const { data: searchedUser } = await axiosInstance.get(`/users/profile/${searchText}`);

      if (searchedUser.error) {
        showToast("Error", searchedUser.error.message, "error");
        return;
      }

      if (searchedUser._id === currentUser._id) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }

      const existingContact = contacts.find((contact) =>
        contact.participants.some((participant) => participant._id === searchedUser._id)
      );

      if (existingContact) {
        setSelectedContact({
          _id: existingContact._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          profilePic: searchedUser.profilePic,
        });

        return;
      }

      const tempContact = {
        mock: true,
        lastMessage: {
          text: "",
          senderId: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };

      setContacts((prevContacts) => [...prevContacts, tempContact]);
    } catch (error) {
      showToast("Error", error.response?.data?.error?.message || error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <Box
      position={"absolute"}
      left={"50%"}
      w={{
        base: "100%",
        md: "80%",
        lg: "750px",
      }}
      p={4}
      transform={"translate(-50%)"}
    >
      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{
          sm: "400px",
          md: "full",
        }}
        mx={"auto"}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{
            sm: "250px",
            md: "full",
          }}
          mx={"auto"}
        >
          <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
            Contacts
          </Text>
          <form onSubmit={handleSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input placeholder="Search for a user" onChange={(e) => setSearchText(e.target.value)} />
              <Button size={"sm"} type="submit" isLoading={searchingUser}>
                <SearchIcon />
              </Button>
            </Flex>
            {loadingContacts &&
              [0, 1, 2, 3, 4].map((_, i) => (
                <Flex key={i} gap={4} alignItems={"center"} p={"1"} borderRadius={"md"}>
                  <SkeletonCircle size={"10"} />
                  <Flex w={"full"} flexDirection={"column"} gap={3}>
                    <Skeleton h={"10px"} w={"80px"} />
                    <Skeleton h={"8px"} w={"90%"} />
                  </Flex>
                </Flex>
              ))}

            {!loadingContacts &&
              contacts.map((contact) => (
                <Contact key={contact._id} contact={contact} isOnline={onlineUsers.includes(contact.participants[0]._id)} />
              ))}
          </form>
        </Flex>
        {!selectedContact._id && (
          <Flex flex={70} borderRadius={"md"} p={2} flexDir={"column"} alignItems={"center"} justifyContent={"center"} height={"400px"}>
            <GiConversation size={100} />
            <Text fontSize={20}>Select a contact to start messaging</Text>
          </Flex>
        )}
        {selectedContact._id && <MessageContainer />}
      </Flex>
    </Box>
  );
};

export default ChatPage;
