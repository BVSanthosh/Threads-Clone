import { Flex, Skeleton, Text, Box, SkeletonCircle } from "@chakra-ui/react";
import SuggestedUser from "./SuggestedUser.jsx";
import useShowToast from "../hooks/useShowToast.js";
import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios"; // import your axios instance

const SuggestedUsers = () => {
    const [loading, setLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const showToast = useShowToast();

    useEffect(() => {
        const getSuggestedUsers = async () => {
            try {
                const res = await axiosInstance.get("/users/suggested");
                const data = res.data;

                if (data.error) {
                    showToast("Error", data.error.message, "error");
                    return;
                }

                setSuggestedUsers(data);
            } catch (error) {
                showToast(
                  "Error", 
                  error.response?.data?.error || error.message || "Failed to fetch suggested users",
                  "error"
                );
            } finally {
                setLoading(false);
            }
        };

        getSuggestedUsers();
    }, [showToast]);

    return (
        <>
            <Text mb={4} fontWeight={"bold"}>
                Suggested Users
            </Text>
            <Flex direction={"column"} gap={4}>
                {loading && 
                    [...Array(3)].map((_, idx) => (
                        <Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
                            <Box>
                                <SkeletonCircle size={"10"} />
                            </Box>
                            <Flex w={"full"} flexDirection={"column"} gap={2}>
                                <Skeleton h={"8px"} w={"80px"} />
                                <Skeleton h={"8px"} w={"90px"} />
                            </Flex>
                            <Flex>
                                <Skeleton h={"20px"} w={"60px"} />
                            </Flex>
                        </Flex>
                    ))
                }

                {!loading && suggestedUsers.map((user) => (
                    <SuggestedUser key={user._id} user={user} />
                ))}
            </Flex>
        </>
    );
};

export default SuggestedUsers;
