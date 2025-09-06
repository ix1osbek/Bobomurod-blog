import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();
// dotenv.config({ path: '/root/ixlosware/.env' });
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("✅ MongoDB Atlas ulandi");
    } catch (err) {
        logger.error("❌ MongoDB ulanish xatosi: " + err.message);
        process.exit(1);
    }
};
