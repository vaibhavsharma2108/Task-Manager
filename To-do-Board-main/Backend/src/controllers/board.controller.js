import TodoBoard from "../model/todoBoard.model.js";


const createBoard = async (req, res) => {
    try {
        const { boardName } = req.body;

        const existingBoard = await TodoBoard.findOne({ boardName });
        if (existingBoard) {
            return res.status(400).json({ success: false, error: "Board with this name already exists" });
        }

        const board = new TodoBoard({
            boardName
        })

        await board.save();
        return res.status(201).json({success: true, message: "Board created successfully", board});
    } catch (error) {
        console.error("Error creating board:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

const fetchActivityLogs = async (req, res) => {
    try {
        const { boardName } = req.params;

        const board = await TodoBoard.findOne({ boardName })
            .select('activityLogs')
            .populate('activityLogs.user')
            .sort({ 'activityLogs.timestamp': -1 })

        return res.status(200).json({ success: true, activityLogs: board.activityLogs.reverse().slice(0, 20) });
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { createBoard, fetchActivityLogs };