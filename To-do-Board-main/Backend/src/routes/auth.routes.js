import { Router } from "express";
import { fetchAllUsers, getSmartUser, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/users/:boardName", fetchAllUsers)
router.get("/getsmartuser", getSmartUser)

export default router;