import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const connectDB = async () => {
    console.log("MongoDB connection attempt starting...");

    try {
        await mongoose.connect(MONGO_URI, {
            dbName: 'epa_ideas_db'
        });

        console.log("✅ MongoDB connected successfully");
        console.log("Connected to DB:", mongoose.connection.name);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1); // Exit process on failure
    }
};
