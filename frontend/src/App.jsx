import { Box, Container } from "@chakra-ui/react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage.jsx";
import PostPage from "./pages/PostPage.jsx";
import Header from "./components/Header.jsx";
import CreatePost from "./components/CreatePost.jsx";
import UpdateProfilePage from "./pages/UpdateProfilePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Settings from "./pages/Settings.jsx";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom.js";

function App() {
  const user = useRecoilValue(userAtom);
  const {pathname} = useLocation();

  return (
    <Box position={"relative"} w={"full"}>
      <Container maxW={ pathname === "/" ? { base: "620px", md: "900px" } : "620px" }>
        <Header />
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          <Route path="/:username" element={user ? (
            <>
              <UserPage />
              <CreatePost />
            </>
          ) : (
            <UserPage />
          )} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App;