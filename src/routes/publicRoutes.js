import { Router } from "express";
import { getPosts, getPostById, addView } from "../controllers/postController.js";
const router = Router();

router.get("/post", getPosts);

router.get("/post/:id", getPostById);

router.post("/post/:id/view", addView);

export default router;
