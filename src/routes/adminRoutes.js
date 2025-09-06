import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { createPost, updatePost, deletePost } from "../controllers/postController.js";
import { adminLogin } from "../controllers/adminAuthController.js";

import { adminAuth } from "../middleware/adminAuth.js"
import rateLimit from "express-rate-limit";


const router = Router();



const loginLimiter = rateLimit({

    windowMs: 24 * 60 * 60 * 1000, // 1 kun
    max: 10, // 3 ta noto‘g‘ri urinishdan keyin blok
    message: "Juda ko‘p xato login urinishlari! Hisobingiz 1 kunga bloklandi.",
    windowMs: 1 * 60 * 1000, // 1 daqiqa
    max: 3, // 3 ta noto‘g‘ri urinishdan keyin blok
    message: "Juda ko‘p xato login urinishlari! Hisobingiz 1 daqiqaga bloklandi.",
    standardHeaders: true,
    legacyHeaders: false,
});


router.post("/login", loginLimiter, adminLogin);

router.post("/post", adminAuth, upload.single("image"), createPost);

router.put("/post/:id", adminAuth, upload.single("image"), updatePost);

router.delete("/post/:id", adminAuth, deletePost);

export default router;
