const mongoose = require('mongoose');

const connectDB = async()=>{
    try {
        await mongoose.connect("mongodb+srv://nishutsuman1998:Nem123@nemcluster.w4wbzvk.mongodb.net/nemtestdb");
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

module.exports = connectDB;