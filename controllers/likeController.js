import Like from '../models/likeModel.js';

const controller = {};

controller.toggleLike = async (req, res) => {
    try {
        const { threadId } = req.body;
    
        if (!threadId) {
            return res.status(400).json({ error: 'Thread ID is required' });
        }
        const userId = req.user.id;
        const existingLike = await Like.findOne({ threadId, userId });

        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);
            return res.status(200).json({ message: 'Unlike successful' });
        } else {
            const newLike = new Like({ threadId, userId });
            await newLike.save();
            return res.status(201).json({ message: 'Like successful' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while toggling like' });
    }
};

export default controller;