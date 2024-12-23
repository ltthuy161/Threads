import { Schema, model } from 'mongoose';

const followSchema = new Schema(
    {
        followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        followeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
    }
);

followSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

const Follow = model('Follow', followSchema);

export default Follow;
