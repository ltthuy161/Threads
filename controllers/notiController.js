import Notification from "../models/notiModel.js";

import Thread from "../models/threadModel.js";
import { User } from "../models/userModel.js";
import Like from "../models/likeModel.js";
import jwt from "jsonwebtoken";

export const createNotification = async ({
    userId,
    recipientId,
    type,
    relatedId,
    message,
}) => {
    try {
        // Kiểm tra các tham số bắt buộc
        if (!userId || !recipientId || !type || !message) {
            throw new Error(
                "Missing required fields: userId, recipientId, type, or message"
            );
        }

        // Tạo đối tượng notification
        const notification = new Notification({
            userId,
            recipientId,
            type,
            relatedId: relatedId || null,
            message,
        });

        // Lưu notification vào database
        const savedNotification = await notification.save();
        console.log("Notification created successfully:", savedNotification);

        // Trả về notification đã lưu
        return savedNotification;
    } catch (error) {
        console.error("Error creating notification:", error.message);
        throw new Error("Failed to create notification");
    }
};

// Lấy tất cả thông báo của một người dùng
export const getNotificationsByUser = async (req, res) => {
    // Xác minh token
    const token = req.cookies.token;
    // get user id from token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded: ", decoded);
    try {
        const firstID = decoded.id;

        if (!firstID) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Fetch all notifications from MongoDB
        const notifications = await Notification.find({
            recipientId: firstID,
        }).sort({ createdAt: -1 });
        console.log("Notifications:", notifications);

        // *** Xử lý thông báo loại "like" ***
        const likeNotifications = notifications.filter(
            (notification) => notification.type === "like"
        );
        const likeRelatedIds = likeNotifications.map(
            (notification) => notification.relatedId
        );
        const likes = await Like.find({ _id: { $in: likeRelatedIds } });
        const likeThreadIds = likes.map((like) => like.threadId);
        const likeThreads = await Thread.find({ _id: { $in: likeThreadIds } });
        const likeThreadContents = likeThreads.map((thread) => thread.content);
        const likeThreadUserIds = likeThreads.map((thread) => thread.userId);
        const likeThreadUsers = await User.find({
            _id: { $in: likeThreadUserIds },
        });
        const likeThreadUserNames = likeThreadUsers.map((user) => user.email);
        const likeUserIds = likeNotifications.map(
            (notification) => notification.userId
        );
        const likeUsers = await User.find({ _id: { $in: likeUserIds } });
        const likeUserNames = likeUsers.map((user) => user.username);
        const likeMessages = likeNotifications.map(
            (notification) => notification.message
        );
        const likeIsRead = likeNotifications.map(
            (notification) => notification.isRead
        );
        const likeCreatedAt = likeNotifications.map(
            (notification) => notification.createdAt
        );

        // *** Xử lý thông báo loại "comment" ***
        const commentNotifications = notifications.filter(
            (notification) => notification.type === "comment"
        );
        const commentThreadIds = commentNotifications.map(
            (notification) => notification.relatedId
        ); // relatedId chính là threadId của comment

        // Tìm các comment (thread có parentThreadId không null)
        const comments = await Thread.find({ _id: { $in: commentThreadIds } });
        if (!comments.length) {
            console.log("No comments found");
        }

        // Lấy thông tin thread gốc (parent thread)
        const parentThreadIds = comments.map(
            (comment) => comment.parentThreadId
        );
        const parentThreads = await Thread.find({
            _id: { $in: parentThreadIds },
        });

        // Lấy nội dung thread gốc
        const parentThreadContents = parentThreads.map(
            (thread) => thread.content
        );

        // Lấy thông tin người tạo thread gốc
        const parentThreadUserIds = parentThreads.map(
            (thread) => thread.userId
        );
        const parentThreadUsers = await User.find({
            _id: { $in: parentThreadUserIds },
        });
        const parentThreadUserNames = parentThreadUsers.map(
            (user) => user.email
        );

        // Lấy thông tin người bình luận (comment)
        const commentUserIds = comments.map((comment) => comment.userId);
        const commentUsers = await User.find({ _id: { $in: commentUserIds } });
        const commentUserNames = commentUsers.map((user) => user.username);

        // Lấy các trường khác từ thông báo
        const commentMessages = commentNotifications.map(
            (notification) => notification.message
        );
        const commentIsRead = commentNotifications.map(
            (notification) => notification.isRead
        );
        const commentCreatedAt = commentNotifications.map(
            (notification) => notification.createdAt
        );

        // Gộp thông tin thông báo "like" và "comment"
        const notificationsInfo = [];

        // Thêm thông báo "like"
        for (let i = 0; i < likeNotifications.length; i++) {
            notificationsInfo.push({
                type: "like",
                threadContent: likeThreadContents[i],
                threadUserName: likeThreadUserNames[i],
                likeUserName: likeUserNames[i],
                message: likeMessages[i],
                isRead: likeIsRead[i],
                createdAt: likeCreatedAt[i],
            });
        }

        // Thêm thông báo "comment"
        for (let i = 0; i < commentNotifications.length; i++) {
            notificationsInfo.push({
                type: "comment",
                threadContent:
                    parentThreadContents[i] || "Thread content not found",
                threadUserName: parentThreadUserNames[i] || "Unknown user",
                commentUserName: commentUserNames[i] || "Unknown user",
                message: commentMessages[i],
                isRead: commentIsRead[i],
                createdAt: commentCreatedAt[i],
            });
        }

        console.log("Notifications info:", notificationsInfo);

        res.status(200).render("notification", {
            title: "Notification",
            hasSidebar: true,
            css: "/css/notification.css",
            notifications: notificationsInfo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
