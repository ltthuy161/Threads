import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    type: { 
        type: String, 
        required: true, 
        enum: ['like', 'comment', 'follow']
    },
    relatedId: { type: Schema.Types.ObjectId, default: null },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = model('Notification', notificationSchema);
export default Notification;