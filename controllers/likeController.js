import Like from '../models/likeModel.js';
import Notification from '../models/notiModel.js';
import Thread from '../models/threadModel.js';

const controller = {};

controller.toggleLike = async (req, res) => {
    try {
        const { threadId } = req.body;

        if (!threadId) {
            return res.status(400).json({ error: 'Thread ID is required' });
        }
        
        const userId = req.user.id; // Người thực hiện "Like"

        // Kiểm tra xem bài viết có tồn tại không
        const thread = await Thread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Kiểm tra xem người dùng đã "Like" chưa
        const existingLike = await Like.findOne({ threadId, userId });

        if (existingLike) {
            // Nếu đã "Like", xóa Like và thông báo liên quan
            await Like.findByIdAndDelete(existingLike._id);
            await Notification.deleteOne({ userId, type: 'like', relatedId: existingLike._id });

            return res.status(200).json({ message: 'Unlike successful' });
        } else {
            // Nếu chưa "Like", tạo Like mới
            const newLike = new Like({ threadId, userId });
            const savedLike = await newLike.save();

            // Xác định người nhận thông báo (chủ bài viết)
            const recipientId = thread.userId;

            if (recipientId && recipientId.toString() !== userId.toString()) {
                // Tạo thông báo nếu người "Like" không phải là chủ bài viết
                const notification = new Notification({
                    userId, // Người thực hiện hành động
                    recipientId, // Người nhận thông báo
                    type: 'like',
                    relatedId: savedLike._id, // Liên kết với đối tượng "Like"
                    message: 'liked your post'
                });

                await notification.save();
            }

            return res.status(201).json({ message: 'Like successful' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while toggling like' });
    }
};

export default controller;