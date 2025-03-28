import { Flex, Input, InputGroup, InputRightElement, Modal, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, Spinner, useDisclosure, ModalContent, Image } from "@chakra-ui/react"
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import useShowToast from "../hooks/useShowToast";
import { contactsAtom, selectedContactAtom } from "../atoms/messagesAtom.js";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useRef, useState } from "react";
import usePreviewImage from "../hooks/usePreviewImage.js";

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedContact = useRecoilValue(selectedContactAtom);
  const setContacts = useSetRecoilState(contactsAtom);
  const showToast = useShowToast();
  const imageRef = useRef(null);
  const {onClose} = useDisclosure();
  const {handleImageChange, imageUrl, setImageUrl} = usePreviewImage();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText && !imageUrl) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedContact.userId,
          img: imageUrl,
        })
      });

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error.message, "error");
        return;
      }

      setMessages((messages) => [...messages, data]);
      setContacts(prevConvos => {
        const updatedConvos = prevConvos.map(convo => {
          if (convo._id === selectedContact._id) {
            return {
              ...convo,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              }
            }
          }

          return convo;
        });

        return updatedConvos;
      });

      setMessageText("");
      setImageUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Flex gap={2} alignItems={"center"}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}> 
        <InputGroup>
            <Input w={"full"} placeholder="Type a message" onChange={(e) => setMessageText(e.target.value)} value={messageText} />
            <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
                <IoSendSharp color="green.500" />
            </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={"pointer"}>
				<BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
				<Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
			</Flex>
			<Modal
				isOpen={imageUrl}
				onClose={() => {
					onClose();
					setImageUrl("");
				}}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex mt={5} w={"full"}>
							<Image src={imageUrl} />
						</Flex>
						<Flex justifyContent={"flex-end"} my={2}>
							{!isSending ? (
								<IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
							) : (
								<Spinner size={"md"} />
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
    </Flex>
  )
}

export default MessageInput;