import { Flex, Spinner, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post.jsx";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom.js";
import SuggestedUsers from "../components/SuggestedUsers.jsx";
import axiosInstance from "../lib/axios";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getFeedPosts = async () => {
      setPosts([]);

      try { 
        const { data } = await axiosInstance.get("/api/posts/feed");

        if (data.error) {
          showToast("Error", data.error.message, "error");
          return;
        }

        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    }

    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <Flex gap={10} alignItems={"flex-start"}>
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <h1>Not following any users.</h1>
        )}

        {loading && (
          <Flex justify="center" alignItems={"center"}>
            <Spinner size={"xl"} />
          </Flex>
        )}

        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy}/>
        ))}
      </Box>
      <Box 
        flex={30} 
        display={{
          base: "none",
          md: "block"
        }}
      >
        <SuggestedUsers />
      </Box>
    </Flex>
  )
}

export default HomePage;
