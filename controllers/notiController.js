import Notification from '../models/notiModel.js';

import Thread from '../models/threadModel.js';
import {User} from '../models/userModel.js';
import Like from '../models/likeModel.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";


async function createThreadObject() {
    try {
        const firstUser = await User.findOne();
        console.log('First User:', firstUser); // Kiểm tra user có tồn tại không
        if (!firstUser) {
            throw new Error('No user found in the database');
        }

        const thread1 = new Thread({
            content: '  ',
            userId: firstUser._id
        });
        console.log('Thread Object (before save):', thread1);

        const savedThread = await thread1.save(); // Lưu vào MongoDB
        console.log('Thread Object (after save):', savedThread);

        return savedThread;
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
}

async function createLikeObject() {
    const thread = await createThreadObject(); // Sử dụng await
    const threadId = thread._id;
    const firstUser = await User.findOne(); // Truy vấn user đầu tiên
    // console.log('First User:', firstUser.email);
    if (!firstUser) {
        throw new Error('No user found');
    }
    const userId = firstUser._id;
    const like1 = new Like({
        threadId: threadId,
        userId: userId
    });

    // Lưu Like vào MongoDB
    const savedLike = await like1.save();
    return { _id: threadId };
}

export const createNotification = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const relatedId = await createLikeObject(); // Kiểm tra createLikeObject
        console.log('Related ID:', relatedId);

        const firstUser = await User.findOne();
        console.log('First User:', firstUser);

        const notification = new Notification({
            userId: firstUser._id,
            type: 'like',
            relatedId: relatedId._id,
            message: 'liked your post'
        });

        const savedNotification = await notification.save();
        console.log('Saved Notification:', savedNotification);

        res.status(201).json({ message: 'Notification created successfully', data: savedNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Lấy tất cả thông báo của một người dùng
export const getNotificationsByUser = async (req, res) => {
    // Xác minh token
    const token = req.cookies.token;
    console.log("token: ", token);
    // get user id from token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded: ", decoded);
    try {
        const firstID = decoded.id;
        console.log(firstID);

        
        // console.log(firstUser.email);
        if (!firstID) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Fetch all notifications from MongoDB
        const notifications = await Notification.find({ userId: firstID }).sort({ createdAt: -1 });
        
        // extract information from notifications is type = like
        const likeNotifications = notifications.filter(notification => notification.type === 'like');
        // from likeNotifications, get relatedId
        const relatedIds = likeNotifications.map(notification => notification.relatedId);
        // get the likes object from relatedId
        const likes = await Like.find({ _id: { $in: relatedIds } });
        // get thread from likes
        const threadIds = likes.map(like => like.threadId);
        const threads = await Thread.find({ _id: { $in: threadIds } });
        
        const threadContents = threads.map(thread => thread.content);
        console.log(threadContents);
        // get user who created the thread
        const threadUserIds = threads.map(thread => thread.userId);
        const threadUsers = await User.find({ _id: { $in: threadUserIds } });
        const threadUserNames = threadUsers.map(user => user.email);
        // get user who liked the thread
        const likeUserIds = likeNotifications.map(notification => notification.userId);
        const likeUsers = await User.find({ _id: { $in: likeUserIds } });
        const likeUserNames = likeUsers.map(user => user.username);
        // get message
        const messages = likeNotifications.map(notification => notification.message);
        // get isRead
        const isRead = likeNotifications.map(notification => notification.isRead);
        console.log(isRead);
        // get createdAt
        const createdAt = likeNotifications.map(notification => notification.createdAt);
        // encapsulate all information in an array
        const notificationsInfo = [];
        for (let i = 0; i < likeNotifications.length; i++) {
            notificationsInfo.push({
                threadContent: threadContents[i],
                threadUserName: threadUserNames[i],
                likeUserName: likeUserNames[i],
                message: messages[i],
                isRead: isRead[i],
                createdAt: createdAt[i]
            });
        }
        
        res.status(200).render("notification", {
            title: "Notification",
            hasSidebar: true,
            css: "/css/notification.css",
            notifications: notificationsInfo,
            activeIcon: "noti-icon",
        });
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
