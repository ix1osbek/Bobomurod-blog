import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
import { connectDB } from "./config/dataSource.js";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import compression from "compression";
import sitemapRoutes from "./routes/sitemap.js";
import robotsRoutes from "./routes/robots.js";

// dotenv.config({ path: '/root/ixlosware/.env' })
dotenv.config()
const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 daqiqa
    max: 20, // limit
    message: "Juda ko‘p so‘rov yubordingiz. Keyinroq urinib ko‘ring!"
});

////////////// cors

app.use(cors({
    origin: (origin, callback) => {
        callback(null, true); // barcha domenlarga ruxsat
    },
    credentials: true
}));

app.use(express.json())
app.use(requestLogger)
app.use(limiter)
app.use(compression())



// API Routes
app.use("/api", publicRoutes);
app.use("/api/nosecret", adminRoutes);
app.use("/", sitemapRoutes);
app.use("/", robotsRoutes);


// 👉 Frontend buildni serve qilish
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Error handler
app.use(notFound);
app.use(errorHandler);

// DB ulash va serverni ishga tushirish
connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`🚀 Server ${PORT} portida ishlayapti`);
    });
});
