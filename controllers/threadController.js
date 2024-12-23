import Thread from '../models/threadModel.js';
import { User } from '../models/userModel.js';
import Follow from '../models/followModel.js';

const controller = {};

controller.init = async (req, res, next) => {
    try {
        res.locals.threads = await Thread.find({ parentThreadId: null })
            .populate('userId', 'username profilePicture email')
            .sort({ createdAt: -1 }); 
        next();
    } catch (error) {
        console.error('Error in init middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.getAllThreads = async (req, res) => {
    try {
        const threads = res.locals.threads;
        res.render('homepage', {
            title: 'Homepage',
            css: '/css/homepage.css',
            hasSidebar: true,
            threads
        });
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).send('Internal Server Error');
    }
};


controller.showFollowingThreads = async (req, res) => {
    try {
        const userId = req.user.id;
        const followees = await Follow.find({ followerId: userId }).select('followeeId');
        const followeeIds = followees.map(f => f.followeeId);

        const threads = await Thread.find({ userId: { $in: followeeIds }, parentThreadId: null })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        res.render('followingThreads', { threads });
    } catch (error) {
        console.error('Error fetching following threads:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.createThread = async (req, res) => {
    try {
        const { content, image, parentThreadId } = req.body;
        const userId = req.user.id;

        if (!userId || !content) {
            return res.status(400).json({ error: 'User ID and content are required' });
        }

        const newThread = new Thread({ userId, content, image, parentThreadId });
        await newThread.save();

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

        const thread = await Thread.findById(id).populate('userId', 'username profilePicture');
        if (!thread) {
            return res.status(404).render('error', { message: 'Thread not found' });
        }

        const replies = await Thread.find({ parentThreadId: id })
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: 1 });
        
        res.render('detailPost', {
            title: `Post by ${thread.userId.username}`,
            css: '/css/homepage.css',
            hasSidebar: true,
            thread, 
            replies
        });
    } catch (error) {
        console.error("Error fetching thread detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default controller;