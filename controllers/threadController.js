import Thread from '../models/threadModel.js';
import Follow from '../models/followModel.js';
import Like from '../models/likeModel.js';
import { User } from "../models/userModel.js";
import { createNotification } from './notiController.js';

const controller = {};

controller.init = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userToView = await User.findById(userId);

        const allThreads = await Thread.find({ parentThreadId: null })
            .populate('userId', 'username profilePicture email')
            .sort({ createdAt: -1 });

        const followees = await Follow.find({ followerId: userId }).select('followeeId');
        const followeeIds = followees.map(f => f.followeeId);

        const followingThreads = await Thread.find({
            userId: { $in: followeeIds },
            parentThreadId: null,
        })
            .populate('userId', 'username profilePicture email')
            .sort({ createdAt: -1 });

        const processThreads = async (threads) => {
            return Promise.all(
                threads.map(async (thread) => {
                    const likeCount = await Like.countDocuments({ threadId: thread._id });
                    const isLiked = await Like.exists({ threadId: thread._id, userId });
                    const replyCount = await Thread.countDocuments({ parentThreadId: thread._id });
                    thread.likeCount = likeCount;
                    thread.isLiked = !!isLiked;
                    thread.replyCount = replyCount;
                    return thread;
                })
            );
        };

        const threadsWithLikes = await processThreads(allThreads);
        const followingThreadsWithLikes = await processThreads(followingThreads);

        res.locals.user = userToView;
        res.locals.threads = threadsWithLikes;
        res.locals.followingThreads = followingThreadsWithLikes;
        next();
    } catch (error) {
        console.error('Error in init middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.getAllThreads = async (req, res) => {
    try {
        const { type } = req.query;
        let threads;
        if (type === 'following') {
            threads = res.locals.followingThreads;
        } else {
            threads = res.locals.threads;
        }
        res.render('homepage', {
            title: 'Homepage / Threads',
            css: '/css/homepage.css',
            hasSidebar: true,
            activeIcon: 'home-icon',
            threads,
            user: res.locals.user,
            type,
        });
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.createThread = async (req, res) => {
    try {
        const { content, image, parentThreadId } = req.body;
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const newThread = new Thread({ userId, content, image, parentThreadId });
        await newThread.save();

        if (parentThreadId) {
            const parentThread = await Thread.findById(parentThreadId);
            console.log('Parent thread:', parentThread);
            if (parentThread) {
                await createNotification({
                    userId,
                    recipientId: parentThread.userId,
                    type: 'comment',
                    relatedId: newThread._id,
                    message: ' replied to your thread.'
                });
            }
        }

        res.status(201).json({ message: 'Thread created successfully', thread: newThread });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

controller.getThreadById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const thread = await Thread.findById(id).populate('userId', 'username profilePicture email');
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        res.status(200).json({ thread });
    } catch (error) {
        console.error('Error fetching thread details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

controller.showDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user.id;
        const viewer = await User.findById(loggedInUserId);
        const thread = await Thread.findById(id).populate('userId', 'username profilePicture email');
        if (!thread) {
            return res.status(404).render('error', { message: 'Thread not found' });
        }
        
        const like_Count = await Like.countDocuments({ threadId: thread._id });
        const is_Liked = await Like.exists({ threadId: thread._id, userId: thread.userId });
        const reply_Count = await Thread.countDocuments({ parentThreadId: thread._id });
        thread.likeCount = like_Count;
        thread.isLiked = !!is_Liked;
        thread.replyCount = reply_Count;

        const replies = await Thread.find({ parentThreadId: id })
            .populate('userId', 'username profilePicture email')
            .sort({ createdAt: -1 });

        const repliesWithLikes = await Promise.all(
            replies.map(async (thread) => {
                const likeCount = await Like.countDocuments({ threadId: thread._id });
                const isLiked = await Like.exists({ threadId: thread._id, userId: thread.userId });
                const replies = await Thread.countDocuments({ parentThreadId: thread._id });
                thread.likeCount = likeCount;
                thread.isLiked = !!isLiked;
                thread.replyCount = replies;
                return thread;
            })
        );
        
        res.render('detailPost', {
            title: `Post by ${thread.userId.username}`,
            css: '/css/homepage.css',
            hasSidebar: true,
            thread, 
            replies: repliesWithLikes,
            user: viewer,
        });
    } catch (error) {
        console.error("Error fetching thread detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default controller;
