import express from 'express';
import { protectRoute } from "../routes/protectRoute.js";
import likeController from "../controllers/likeController.js";

const router = express.Router();

router.post('/toggle-like', protectRoute, likeController.toggleLike);

export default router;
