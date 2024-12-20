import { Schema, model } from 'mongoose';

const threadSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentThreadId: { type: Schema.Types.ObjectId, ref: 'Thread', default: null },
    content: { type: String, default: null },
    image: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Thread = model('Thread', threadSchema);
export default Thread;