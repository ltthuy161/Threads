import express from 'express';
import { protectRoute } from "../routes/protectRoute.js";
import threadController from "../controllers/threadController.js";

const router = express.Router();

router.post('/threads/create', protectRoute, threadController.createThread);
router.get('/threads/detail/:id', threadController.showDetails);
router.use('/threads/', protectRoute, threadController.init);
router.get('/threads/', (req, res, next) => {
    req.query.type = 'forYou'; 
    next();
}, threadController.getAllThreads);
router.get('/threads/following', (req, res, next) => {
    req.query.type = 'following'; 
    next();
}, threadController.getAllThreads);
router.get('/threads/:id', threadController.getThreadById);
export default router;
