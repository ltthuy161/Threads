import express from 'express';
import { createNotification, getNotificationsByUser, markAsRead, deleteNotification, hasUnreadNotifications } from '../controllers/notiController.js';
import { protectRoute} from './protectRoute.js';
const router = express.Router();

// Endpoint để tạo thông báo
router.get('/create-notifications', createNotification);
// Endpoint để lấy tất cả thông báo
router.use('/notification', protectRoute, getNotificationsByUser);

router.put("/notifications/:id/mark-as-read", protectRoute, markAsRead);
router.delete("/notifications/:id", protectRoute, deleteNotification);
router.get("/notifications/has-unread", protectRoute, hasUnreadNotifications);

export default router;