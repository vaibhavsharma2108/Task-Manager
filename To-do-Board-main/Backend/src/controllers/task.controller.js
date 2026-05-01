import Task from "../model/task.model.js";
import User from "../model/user.model.js";
import { addNewActivityLog } from "../utils/activityLogs.js";
import resolveConflict from "../utils/resolveConflict.js";

const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority, boardName } = req.body;

        const io = req.app.locals.io

        const {userId, username} = req.user;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        if (!title || !description || !assignedUser) {
            return res.status(400).json({ success: false, error: "Title, description, and assigned user are required" });
        }

        const existingTask = await Task.findOne({ title });
        if (existingTask) {
            return res.status(400).json({ success: false, error: "Task with this title already exists" });
        }

        const user = await User.findById(assignedUser);
        if (!user) {
            return res.status(404).json({ success: false, error: "Assigned user not found" });
        }

        const task = new Task({
            title,
            description,
            assignedUser,
            createdBy: userId,
            status: status || 'todo',
            priority: priority || "Medium",
        });

        await task.save();

        task.populate('assignedUser');

        user.assignedTasks.push(task._id);
        await user.save();

        await addNewActivityLog({
            boardName,
            userId,
            action: `Task "${title}" created by user @${username}`,
            io
        });

        io.to(boardName).emit('newTask', task);
        return res.status(201).json({ success: true, task });
    } catch (error) {
        console.log("Error creating task:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedUser');

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ success: false, error: "No tasks found" });
        }

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.log("Error fetching tasks:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

const editTask = async (req, res) => {
    try {
        const { title, status, description, assignedUser, priority, boardName, lastUpdated, isMerge, isOverwrite } = req.body;

        const io = req.app.locals.io
        const {userId, username} = req.user;
        let newDescription = description;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }
        const task = await Task.findOne({title});
        if (!task) {
            return res.status(404).json({ success: false, error: "Task not found" });
        }

        if(isMerge){
            newDescription = resolveConflict(task.description, description);

        } else if(lastUpdated && new Date(lastUpdated) <= task.lastUpdated) {
            if(!isOverwrite) return res.status(400).json({ success: false, conflict: true, error: "Task has been modified by another user", task });
        }

        if(assignedUser) {
            const user = await User.findById(assignedUser);
            if (!user) {
                return res.status(404).json({ success: false, error: "Assigned user not found" });
            }
            
            const existingAssignedUser = await User.findById(task.assignedUser);
            if (existingAssignedUser) {
                existingAssignedUser.assignedTasks = existingAssignedUser.assignedTasks.filter(
                    (taskId) => taskId.toString() !== task._id.toString()
                );
                await existingAssignedUser.save();
            }

            user.assignedTasks.push(task._id);
            await user.save();
        }

        task.title = title || task.title;
        task.status = status || task.status;
        task.description = newDescription || task.description;
        task.assignedUser = assignedUser || task.assignedUser;
        task.priority = priority || task.priority;


        await task.save();

        task.populate('assignedUser');

        await addNewActivityLog({
            boardName,
            userId,
            action: `Task "${title}" edited by user @${username}`,
            io
        });

        io.to(boardName).emit('updateTask', task)
        return res.status(200).json({ success: true, task });
    } catch (error) {
        console.log("Error editing task:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

const deleteTask = async (req, res) => {
    try {
        const {title, boardName} = req.query;

        console.log("Deleting task with title:", title);
        const io = req.app.locals.io
        const task = await Task.deleteOne({title});
        if (!task) {
            return res.status(404).json({ success: false, error: "Task not found" });
        }

        const {userId, username} = req.user;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        const user = await User.findById(task.assignedUser);
        if (user) {
            user.assignedTasks = user.assignedTasks.filter(
                (taskId) => taskId.toString() !== task._id.toString()
            );
            await user.save();
        }

        await addNewActivityLog({
            boardName,
            userId,
            action: `Task "${title}" deleted by user @${username}`,
            io
        });

        io.to(boardName).emit("deleteTask", title);
        return res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        console.log("Error deleting task:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export { createTask, getTasks, editTask, deleteTask };