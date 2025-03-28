import { VStack, Box, Flex, Text, Avatar, Menu, MenuButton, MenuItem, Portal, MenuList, Link, Button } from "@chakra-ui/react"
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom.js";
import { useRecoilValue } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import useHandleFollow from "../hooks/useHandleFollow.js";

const UserHeader = ({ user }) => {
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const {toggleFollow, updating, following } = useHandleFollow(user);

  const copyURL = () => {
    const currentUrl = window.location.href;
    
    navigator.clipboard.writeText(currentUrl).then(() => {  
      showToast("Account created.", "Profile link copied", "success");
    });
  };

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>threads.next</Text>
          </Flex>
        </Box> 
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>
      <Text>{user.bio}</Text>
      {currentUser?._id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"}>Update Profile</Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
          <Button size={"sm"} onClick={toggleFollow} isLoading={updating}>
            {following ? "Unfollow" : "Follow"}
          </Button>
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"}>{user.followers.length}</Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Link color={"gray.light"}>instagoon.com</Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <BsInstagram size={24} cursor={"pointer"}/>
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={"pointer"}/> 
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem bg={"gray.dark"} onClick={copyURL}>Copy link</MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>
      <Flex w={"full"}>
        <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb="3" curosr={"pointer"}>
          <Text fontWeight={"bold"}>
            Threads
          </Text>
        </Flex>
        <Flex flex={1} borderBottom={"1.5px solid gray"} justifyContent={"center"} color={"gray.light"} pb="3" curosr={"pointer"}>
          <Text fontWeight={"bold"}>
            Replies
          </Text>
        </Flex>
      </Flex>
    </VStack>
  )
}

export default UserHeader