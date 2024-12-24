import express from 'express';
import { createNotification, getNotificationsByUser } from '../controllers/notiController.js';
import { protectRoute } from './protectRoute.js';
const router = express.Router();

// Endpoint để tạo thông báo
router.get('/create-notifications', createNotification);
// Endpoint để lấy tất cả thông báo
router.use('/notification', protectRoute, getNotificationsByUser);

// Endpoint để lấy tất cả thông báo của một người dùng
//router.get('/notifications/:userId', getNotificationsByUser);

export default router;