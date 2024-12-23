import express from 'express';
import { protectRoute } from "../routes/protectRoute.js";
import threadController from "../controllers/threadController.js";

const router = express.Router();
router.use('/', protectRoute, threadController.init);
router.post('/create', protectRoute, threadController.createThread);
router.get('/', protectRoute, threadController.getAllThreads);
router.get('/following', protectRoute, threadController.showFollowingThreads);
router.get('/detail/:id', protectRoute, threadController.showDetails);
router.get('/:id', protectRoute, threadController.getThreadById);

export default router;
