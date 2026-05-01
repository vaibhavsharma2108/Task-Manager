import { Router } from "express";
import { createBoard, fetchActivityLogs } from "../controllers/board.controller.js";


const router = Router();

router.post("/createboard", createBoard);
router.get("/activitylogs/:boardName", fetchActivityLogs);

export default router;