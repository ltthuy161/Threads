import { Schema, model } from 'mongoose';

const followSchema = new Schema({
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
}, {
    indexes: [{ unique: true, fields: ['followerId', 'followeeId'] }]
});

const Follow = model('Follow', followSchema);
export default Follow;