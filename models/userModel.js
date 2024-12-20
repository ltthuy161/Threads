import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, maxlength: 100 },
    password: { type: String, required: true },
    bio: { type: String, default: null },
    profilePicture: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

const User = model("User", userSchema);
export { User }; // Named Export
