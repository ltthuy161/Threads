import express from 'express';
import likeController from "../controllers/likeController.js";

const router = express.Router();

router.post('/toggle-like', isAuthenticated, toggleLike);

export default router;
