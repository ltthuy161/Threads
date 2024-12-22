import { Schema, model } from 'mongoose';

const likeSchema = new Schema({
    threadId: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Like = model('Like', likeSchema);
export default Like;
