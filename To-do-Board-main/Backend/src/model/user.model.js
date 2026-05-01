import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TodoBoard',
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    assignedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }]
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
