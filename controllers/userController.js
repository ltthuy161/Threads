import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const { username, email, password, bio, profilePicture } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        // Enforce password strength
        if (password.length < 8) {
            return res
                .status(400)
                .json({ error: "Password must be at least 8 characters long" });
        }

        // Hash the password
        const hashPassword = bcrypt.hashSync(password, 10);

        // Check for duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const newUser = new User({
            username,
            email,
            password: hashPassword,
        });
        await newUser.save();
        console.log("New User:", newUser);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
};

export default createUser;
