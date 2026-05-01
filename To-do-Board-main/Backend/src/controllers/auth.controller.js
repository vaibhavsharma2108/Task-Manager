import User from "../model/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import TodoBoard from "../model/todoBoard.model.js";

const registerUser = async (req, res, next) => {
    try {
        const { name, username, password, boardName } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const board = await TodoBoard.findOne({ boardName });

        const user = new User({ name, username, password: hashedPassword, board: board._id });
        await user.save();

        board.users.push(user._id);
        await board.save();

        const accessToken = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.cookie('accessToken', accessToken, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return res.status(201).json({ success: true, message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await User.findOne({ username }).populate("board");
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.cookie('accessToken', accessToken, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return res.status(200).json({ success: true, message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const fetchAllUsers = async (req, res) => {
    try {

        const { boardName } = req.params;

        const board = await TodoBoard.findOne({ boardName })

        if (!board) {
            return res.status(404).json({ success: true, message: "No such board found" })
        }
        const users = await User.find({ board: board._id })

        return res.status(200).json({ success: true, message: "Users fetched successfully", users })
    } catch (error) {
        console.log("error fetching users: ", error)
        return res.status(500).json({ success: false, message: "Internal server Error" })
    }
}

const getSmartUser = async (req, res) => {
    try {
        const users = await User.find()
            .populate('assignedTasks');

        if (!users || users.length === 0) {
            throw new Error('No users found');
        }

        const userTaskCounts = users.map(user => {
            const activeCount = user.assignedTasks.filter(task =>
                task.status === 'todo' || task.status === 'in-progress'
            ).length;

            return {
                userId: user._id,
                activeCount,
            };
        });

        userTaskCounts.sort((a, b) => a.activeCount - b.activeCount);


        return res.status(200).json({success: true, message: "Smart user assigned", user: userTaskCounts[0].userId});


    } catch (error) {
        console.log("error in smat assign", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export { registerUser, loginUser, logoutUser, fetchAllUsers, getSmartUser };