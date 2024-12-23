import express from 'express';
import { protectRoute } from "../routes/protectRoute.js";
import threadController from "../controllers/threadController.js";

const router = express.Router();

router.post('/threads/create', protectRoute, threadController.createThread);
router.get('/threads/following', threadController.showFollowingThreads);
router.get('/threads/detail/:id', threadController.showDetails);

router.get('/threads/:id', threadController.getThreadById);
router.use('/threads/', protectRoute, threadController.init);
router.get('/threads/', threadController.getAllThreads);

export default router;
