import Like from '../models/like.js';

export const toggleLike = async (req, res) => {
    try {
        const { threadId } = req.body;
        const userId = req.user._id; // Giả sử bạn có middleware xác thực và gắn user vào req

        if (!threadId) {
            return res.status(400).json({ error: 'Thread ID is required' });
        }

        // Kiểm tra xem user đã like thread này chưa
        const existingLike = await Like.findOne({ threadId, userId });

        if (existingLike) {
            // Nếu đã like, xóa like (unlike)
            await Like.findByIdAndDelete(existingLike._id);
            return res.status(200).json({ message: 'Unlike successful' });
        } else {
            // Nếu chưa like, tạo mới
            const newLike = new Like({ threadId, userId });
            await newLike.save();
            return res.status(201).json({ message: 'Like successful' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while toggling like' });
    }
};
