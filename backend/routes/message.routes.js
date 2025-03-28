import express from "express";
import { sendMessage, getMessages, getConversations } from "../controllers/message.controller.js";
import authenticateToken from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/conversations", authenticateToken, getConversations);
router.post("/", authenticateToken, sendMessage);
router.get("/:id", authenticateToken, getMessages);

export default router;