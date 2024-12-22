import express from "express";
import { protectRoute } from "../routes/protectRoute.js";

const router = express.Router();

// Route cần xác thực
router.get("/notification", protectRoute, (req, res) => {
    res.send(`Welcome, ${req.user.username}. This is a protected route.`);
});

export default router;