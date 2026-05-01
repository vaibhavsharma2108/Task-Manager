import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import connectToDB from './config/dbConnect.js';
import authRouter from './routes/auth.routes.js';
import boardRouter from './routes/board.routes.js';
import isAuthenticated from './utils/isAuthenticated.js';
import taskRouter from './routes/task.routes.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

// ✅ Load env variables
dotenv.config();

// ✅ DEBUG: check if MONGO_URI is loading
console.log("MONGO_URI:", process.env.MONGO_URI);

const PORT = process.env.PORT || 3000;

// ✅ Connect DB
await connectToDB();

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const io = new Server(server, {
    cors: { origin: '*' }
});

app.locals.io = io;

io.on('connection', (socket) => {
    socket.on('joinBoard', (boardName) => {
        console.log(`Socket ${socket.id} joining board: ${boardName}`);
        socket.join(boardName);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    return res.send('Welcome to the Express server!');
});

app.use('/api/auth', authRouter);
app.use('/api/board', boardRouter);
app.use('/api/task', isAuthenticated, taskRouter);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});