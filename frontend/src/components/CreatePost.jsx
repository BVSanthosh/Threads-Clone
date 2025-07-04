import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useColorModeValue,
  useDisclosure,
  Text,
  Input,
  Flex,
  CloseButton,
  Image,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImage from "../hooks/usePreviewImage";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom.js";
import { useParams } from "react-router-dom";
import axiosInstance from "../lib/axios";  // <-- import your axios instance

const MAX_CHAR = 500;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR);
  const { handleImageChange, imageUrl, setImageUrl } = usePreviewImage();
  const imageRef = useRef(null);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncate = inputText.slice(0, MAX_CHAR);
      setPostText(truncate);
      setRemainingChars(0);
    } else {
      setPostText(inputText);
      setRemainingChars(MAX_CHAR - inputText.length);
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.post("/posts/create", {
        postedBy: user._id,
        text: postText,
        img: imageUrl,
      });

      const data = res.data;

      if (data.error) {
        showToast("Error", data.error.message, "error");
        return;
      }

      if (username === user.username) {
        setPosts([data, ...posts]);
      }

      showToast("Success", "Post created successfully", "success");
      onClose();
      setPostText("");
      setImageUrl("");
    } catch (error) {
      showToast(
        "Error",
        error.response?.data?.error || error.message || "Failed to create post",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={5}
        bgg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
        size={{
          base: "sm",
          sm: "md",
        }}
      >
        <AddIcon />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="Post content goes here"
                onChange={handleTextChange}
                value={postText}
              />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign={"right"}
                m={"1"}
                color={"gray.800"}
              >
                {remainingChars}/{MAX_CHAR}
              </Text>
              <Input
                type="file"
                ref={imageRef}
                onChange={handleImageChange}
                hidden
              />
              <BsFillImageFill
                style={{ margin: "5px", cursor: "pointer" }}
                onClick={() => imageRef.current.click()}
              />
            </FormControl>

            {imageUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imageUrl} alt="Selected image" />
                <CloseButton
                  onClick={() => setImageUrl("")}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
