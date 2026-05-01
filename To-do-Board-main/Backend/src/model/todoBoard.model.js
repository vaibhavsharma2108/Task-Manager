import mongoose from "mongoose";


const boardSchema = new mongoose.Schema({
    boardName:{
        type: String,
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    activityLogs: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        }
    }]
})

const TodoBoard = mongoose.model('TodoBoard', boardSchema);

export default TodoBoard;
