import { Router } from "express";
import { createTask, deleteTask, editTask, getTasks } from "../controllers/task.controller.js";

const router = Router();

router.post("/createtask", createTask);
router.get("/gettasks", getTasks);
router.put("/edittask", editTask);
router.delete("/deletetask", deleteTask);

export default router;