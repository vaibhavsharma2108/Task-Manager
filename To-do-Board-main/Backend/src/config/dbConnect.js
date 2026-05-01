import mongoose from "mongoose";


const connectToDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: 'todo-board',
        });
        console.log('Connected to MongoDB:', connection.connection.host);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);   
    }
};

export default connectToDB;