import { Flex, Image, useColorMode, Link, Button} from "@chakra-ui/react";
import { useRecoilValue, useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout.js";
import authScreenAtom from "../atoms/authAtom";
import { MdOutlineSettings } from "react-icons/md";

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { logout } = useLogout();
    const user = useRecoilValue(userAtom);
    const setAuthScreen = useRecoilState(authScreenAtom);

    return (
        <Flex alignItems={"center"} justifyContent={"space-between"} mt={6} mb={12}>
            <Flex alignItems={"center"} gap={4}>
                {user && (
                    <>
                        <Link as={RouterLink} to="/">
                            <AiFillHome size={24}/>
                        </Link>
                        <Link as={RouterLink} to={"/chat"}>
                            <BsFillChatQuoteFill size={20}/>
                        </Link>
                        <Link as={RouterLink} to={`/${user.username}`}>
                            <RxAvatar size={24}/>
                        </Link>
                    </>
                )}
            </Flex>
            <Flex alignItems={"center"} gap={4}>
                {user && (
                    <Flex alignItems={"center"} gap={4}>
                        <Link as={RouterLink} to={"/settings"}>
                            <MdOutlineSettings size={20}/>
                        </Link>
                        <Button size={"xs"} onClick={logout}>
                            <FiLogOut size={20}/>
                        </Button>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
}

export default Header;