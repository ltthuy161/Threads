import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from 'fs/promises'; 
import path from 'path';

import Follow  from "../models/followModel.js";
import Thread from '../models/threadModel.js';
import Like from '../models/likeModel.js';
import Notification from '../models/notiModel.js';

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

export const createUser = async (req, res) => {
    try {

        const { username, email, password, bio, profilePicture } = req.body;

        // Hash the password
        const hashPassword = bcrypt.hashSync(password, 10);

        // Check for duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(201).render("signup", {
                title: "Sign Up",
                hasSidebar: false, // Không có sidebar
                css: "/css/signup.css",
                message:
                    "This email is already registered. Please sign in or use a different email.",
            });
        }

        // username is unique
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(201).render("signup", {
                title: "Sign Up",
                hasSidebar: false, // Không có sidebar
                css: "/css/signup.css",
                message:
                    "This username is already taken. Please choose a different username.",
            });
        }

        // Tạo JWT chứa thông tin người dùng
        const verificationToken = jwt.sign(
            { username, email, password: hashPassword }, // Lưu thông tin trong token
            SECRET_KEY,
            { expiresIn: "1h" } // Token hết hạn sau 1 giờ
        );

        // Tạo liên kết xác minh
        const verificationLink = `${req.protocol}://${req.get(
            "host"
        )}/email-authentication/${verificationToken}`;

        // Cấu hình transporter để gửi email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Nội dung email xác minh
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email Verification",
            html: `<p>Please click the link below to verify your email:</p>
                   <a href="${verificationLink}">${verificationLink}</a>`,
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        res.status(201).render("signup", {
            title: "Sign Up",
            hasSidebar: false, // Không có sidebar
            css: "/css/signup.css",
            message:
                "Account created! Please check your email to verify your account.",
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
};

// **Xác minh email và hiển thị trang thành công**
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Render trang xác minh thành công với token
        res.render("email-authentication", {
            title: "Email Verification",
            token, // Gửi token tới giao diện để xử lý bước tiếp theo
            css: "/css/email-authentication.css",
        });
    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(400).json({ error: "Invalid or expired token" });
    }
};

// **Lưu người dùng sau khi xác minh thành công**
export const saveUser = async (req, res) => {
    try {
        const { token } = req.body;

        // Giải mã token
        const decoded = jwt.verify(token, SECRET_KEY);

        const { username, email, password } = decoded;

        // Lưu người dùng vào cơ sở dữ liệu
        const newUser = new User({
            username,
            email,
            password,
            isVerified: true, // Đánh dấu là đã xác minh
        });

        await newUser.save();

        // Điều hướng đến trang đăng nhập
        res.redirect("/signin");
    } catch (error) {
        console.error("Error during saving user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.render("signin", {
                title: "Sign In",
                hasSidebar: false, // Không có sidebar
                css: "/css/signin.css",
                message: "Invalid email or password",
            })
        }

        // Verify password
        const passwordCorrect = bcrypt.compareSync(
            password,
            existingUser.password
        );
        if (!passwordCorrect) {
            return res.render("signin", {
                title: "Sign In",
                hasSidebar: false, // Không có sidebar
                css: "/css/signin.css",
                message: "Invalid email or password",
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            SECRET_KEY,
            { expiresIn: "1h" } // Token expiration time
        );
        
        // set user in session
        res.user = existingUser;
        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.redirect("/homepage");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.redirect("/signin");
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const { password }  = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).render("forgot-pw", {
                title: "Forgot Password",
                css: "/css/forgot-pw.css",
                message: "Your email is not registered. Please sign up.",
            });
        }

        // Tạo reset token
        const resetToken = jwt.sign({ email, password }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // Tạo liên kết reset
        const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

        // Gửi email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `<p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>`,
        };

        await transporter.sendMail(mailOptions);

        // Phản hồi người dùng
        res.status(200).render("forgot-pw", {
            title: "Forgot Password",
            css: "/css/forgot-pw.css",
            message: "Please check your email to reset your password.",
        });
        // res.redirect(`/forgot-password?message=Please check your email to reset your password.`);
    } catch (error) {
        console.error("Error in requestPasswordReset:", error.message);
        res.status(500).render("forgot-pw", {
            title: "Forgot Password",
            css: "/css/forgot-pw.css",
            message: "An error occurred. Please try again.",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Xác minh token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Kiểm tra payload token
        if (!decoded.email) {
            return res.status(400).json({ error: "Invalid token payload." });
        }
        if (!decoded.password) {
            return res.status(400).json({ error: "Password is required." });
        }
        // Tìm người dùng bằng email
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Lưu mật khẩu mới
        user.password = bcrypt.hashSync(decoded.password, 10); // Băm mật khẩu mới
        await user.save();
        res.render("reset-password", 
            { title: "Reset Password", css: "/css/reset-password.css", token });
        // res.redirect("/signin");
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ error: "Token has expired. Please request a new one." });
        }
        console.error("Error resetting password:", error.message);
        res.status(400).json({ error: "Invalid or expired token." });
    }
};

export const getProfile = async (req, res) => {
    try {

        // test id
        const userId = req.user.id;
    
        // Fetch the user from the database
        const user = await User.findById(userId);
    
        if (!user) {
            // Handle the case where the user is not found
            return res.status(404).render("error", { message: "User not found" });
        }

        const followerCount = await Follow.countDocuments({ followeeId: userId });
        const followingCount = await Follow.countDocuments({ followerId: userId });

        // Render the profile view and pass the user data
        res.render("profile", {
            title: "Threads - Profile",
            css: "/css/profile.css",
            hasSidebar: false, // or true if needed
            user: user, // Pass the user object to the template
            isCurrentUser: true,
            followerCount: followerCount, // Pass the counts to the template
            followingCount: followingCount,
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

// Function to render the edit profile form
export const editProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        res.render("edit-profile", {
            title: "Edit Profile",
            css: "/css/edit-profile.css",
            hasSidebar: false,
            user: user, // Pass the current user data to populate the form
            isCurrentUser: true,
        });
    } catch (error) {
        console.error("Error fetching user data for edit:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, profilePicture } = req.body;

        const updateObject = {};
        if (name) updateObject.username = name;
        if (bio) updateObject.bio = bio;
        if (profilePicture) updateObject.profilePicture = profilePicture;

        // Check for existing username *before* updating
        if (name) {
            const existingUsername = await User.findOne({ username: name });
            if (existingUsername && existingUsername._id.toString() !== userId) {
                // Found a user with the same username who is NOT the current user
                return res.status(400).json({ message: "This username is already taken. Please choose a different username." });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateObject,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Redirect to the profile page after successful update
        res.redirect(`/profile/${userId}`);

    } catch (error) {
        console.error("Error updating user profile:", error);

        // Handle unique constraint violation (duplicate username) - still needed in case of race conditions
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            return res.status(400).json({ message: "Username already exists" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // Logged-in user's ID
        const userIdToView = req.params.userId; // ID of the user to view (get this from URL params)

        const viewer = await User.findById(loggedInUserId);
        // Fetch the user to view from the database
        const userToView = await User.findById(userIdToView);

        if (!userToView) {
            return res.status(404).render("error", { message: "User not found" });
        }

        const followerCount = await Follow.countDocuments({ followeeId: userToView });
        const followingCount = await Follow.countDocuments({ followerId: userToView });

        const isFollowing = await checkIfFollowing(loggedInUserId, userIdToView);

        const threads = await Thread.find({ userId: userIdToView, parentThreadId: null })
            .populate("userId", "_id username profilePicture email")
            .sort({ createdAt: -1 });

        // Thêm thông tin likeCount, isLiked, replyCount vào từng thread
        const threadsWithDetails = await Promise.all(
            threads.map(async (thread) => {
                const likeCount = await Like.countDocuments({ threadId: thread._id });
                const isLiked = await Like.exists({ threadId: thread._id, userId: loggedInUserId });
                const replies = await Thread.countDocuments({ parentThreadId: thread._id });
                thread.likeCount = likeCount;
                thread.isLiked = !!isLiked;
                thread.replyCount = replies;
                return thread;
            })
        );

        res.render("profile", {
            title: `${userToView.username}'s Profile`,
            css: "/css/profile.css",
            hasSidebar: true,
            user: viewer,
            userToView: userToView,
            isCurrentUser: loggedInUserId === userIdToView,
            isFollowing: isFollowing,
            followerCount: followerCount,
            followingCount: followingCount,
            threads: threadsWithDetails,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

async function checkIfFollowing(loggedInUserId, userIdToView) {
    try {
        const followRelationship = await Follow.findOne({
            followerId: loggedInUserId,
            followeeId: userIdToView,
        });
        return !!followRelationship; // Returns true if a follow relationship exists, false otherwise
    } catch (error) {
        console.error("Error checking follow relationship:", error);
        return false; // Return false on error (or handle it differently if needed)
    }
};

export const followUser = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const userIdToFollow = req.params.userId;

        // Prevent user from following themselves
        if (loggedInUserId === userIdToFollow) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            followerId: loggedInUserId,
            followeeId: userIdToFollow,
        });

        if (existingFollow) {
            return res.status(400).json({ message: "Already following this user" });
        }

        // Create follow relationship
        const newFollow = new Follow({
            followerId: loggedInUserId,
            followeeId: userIdToFollow,
        });
        await newFollow.save();

        // Create notification
        const userId = loggedInUserId;
        const recipientId = userIdToFollow;

        const notification = new Notification({
            userId,
            recipientId,
            type: "follow",
            relatedId: newFollow._id,
            message: " started following you.",
        });
        await notification.save();

        res.status(200).json({ message: "Followed successfully" });
        
    } catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const userIdToUnfollow = req.params.userId;

        // Check if following
        const existingFollow = await Follow.findOne({
            followerId: loggedInUserId,
            followeeId: userIdToUnfollow,
        });

        if (!existingFollow) {
            return res.status(400).json({ message: "Not following this user" });
        }

        // Delete follow relationship
        await Follow.deleteOne({
            followerId: loggedInUserId,
            followeeId: userIdToUnfollow,
        });

        await Notification.deleteOne({ userId: loggedInUserId, recipientId: userIdToUnfollow, type: "follow", relatedId: existingFollow._id });

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        // Get the list of followers (users who are following the current user)
        const followers = await Follow.find({ followeeId: userId })
            .populate("followerId", "username profilePicture bio") // Populate the follower's data
            .lean(); // Convert to plain JavaScript objects

        // Extract the follower data
        const followerUsers = followers.map((follow) => follow.followerId);
        const currentUsername = req.user.username; 

        res.render("follower", {
            title: "Followers",
            css: "/css/follower.css", // Assuming you're using the same CSS for both
            hasSidebar: true,
            users: followerUsers,
            isFollowerPage: true,
            user: user,
        });
    } catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        // Get the list of users the current user is following
        const following = await Follow.find({ followerId: userId })
            .populate("followeeId", "username profilePicture bio") // Populate the followee's data
            .lean();

        // Extract the following data
        const followingUsers = following.map((follow) => follow.followeeId);

        res.render("following", {
            title: "Following",
            css: "/css/following.css",
            hasSidebar: true,
            users: followingUsers,
            isFollowerPage: false,
            user: user,
        });
    } catch (error) {
        console.error("Error fetching following:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};