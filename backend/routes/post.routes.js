import express from "express";
import { createPost, getPost, deletePost, toggleLike, replyToPost, getFeed, getUserPost } from "../controllers/post.controller.js";
import authenticateToken from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/feed", authenticateToken, getFeed);
router.get("/:id", authenticateToken, getPost);
router.get("/user/:username", authenticateToken, getUserPost);
router.post("/create", authenticateToken, createPost);
router.delete("/:id", authenticateToken, deletePost);
router.put("/like/:id", authenticateToken, toggleLike);
router.put("/reply/:id", authenticateToken, replyToPost);

export default router;