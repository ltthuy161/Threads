import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

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

        // Giải mã token
        const decoded = jwt.verify(token, SECRET_KEY);

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
        console.log("Request Body:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Verify password
        const passwordCorrect = bcrypt.compareSync(
            password,
            existingUser.password
        );
        if (!passwordCorrect) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            SECRET_KEY,
            { expiresIn: "1h" } // Token expiration time
        );

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.redirect("/");
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
        const { email, newPassword } = req.body;

        // Kiểm tra email trong cơ sở dữ liệu
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Email không tồn tại." });
        }

        // Tạo JWT reset token chứa email và mật khẩu mới
        const resetToken = jwt.sign(
            { email: user.email, newPassword }, // Payload chứa email và mật khẩu mới
            process.env.SECRET_KEY, // Secret key từ .env
            { expiresIn: "1h" } // Token hết hạn sau 1 giờ
        );

        // Tạo liên kết reset password
        const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

        // Gửi email với liên kết reset
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
            subject: "Password Reset Confirmation",
            html: `<p>You requested to reset your password.</p>
                   <p>Click the link below to confirm your new password:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>If you did not request this, please ignore this email.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).render("forgot-pw", {
            title: "",
            hasSidebar: false, // Không có sidebar
            css: "/css/forgot-pw.css",
            message:
                "Please check your email to complete reset password.",
        });

    } catch (error) {
        console.error("Error sending reset password email:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        // Xác minh token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Lấy thông tin từ token
        const { email, newPassword } = decoded;

        // Tìm người dùng bằng email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại." });
        }

        // Lưu mật khẩu mới vào cơ sở dữ liệu
        user.password = bcrypt.hashSync(newPassword, 10); // Băm mật khẩu mới
        await user.save();

        res.redirect("/signin");
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ error: "Token đã hết hạn. Vui lòng yêu cầu lại." });
        }
        console.error("Error resetting password:", error.message);
        res.status(400).json({ error: "Invalid or expired token." });
    }
};

export const getProfile = async (req, res) => {
    try {

        // test id
        const userId = "676800579fdee627295c671c";
    
        // Fetch the user from the database
        const user = await User.findById(userId);
    
        if (!user) {
            // Handle the case where the user is not found
            return res.status(404).render("error", { message: "User not found" });
        }
    
        // Add a temporary default image if profilePicture is null
        if (!user.profilePicture) {
            user.profilePicture = "../../assets/img/avatar/ava4.png";
        }

        // Render the profile view and pass the user data
        res.render("profile", {
            title: "Threads - Profile",
            css: "/css/profile.css",
            hasSidebar: false, // or true if needed
            user: user, // Pass the user object to the template
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};