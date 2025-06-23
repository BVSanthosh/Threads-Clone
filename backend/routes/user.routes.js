import express from "express";
import { signup, login, logout, toggleFollow, updateProfile, getProfile, getSuggestedUsers, freezeAccount, authUser } from "../controllers/user.controller.js";
import authenticateToken from "../middlewares/authenticateUser.js";

const router = express.Router();

router.get("/profile/:query", getProfile);
router.get("/suggested", authenticateToken, getSuggestedUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/auth", authUser);
router.post("/follow/:id", authenticateToken, toggleFollow);
router.put("/update/:id", authenticateToken, updateProfile);
router.put("/freeze", authenticateToken, freezeAccount);

export default router;