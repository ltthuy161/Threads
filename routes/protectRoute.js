import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

export const protectRoute = (req, res, next) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.token;

        if (!token) {
            // Chuyển hướng đến /signup nếu không có token
            return res.redirect("/signup");
        }

        // Xác minh token
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log(SECRET_KEY)
        req.user = decoded; // Lưu thông tin người dùng vào req để sử dụng sau

        next(); // Cho phép tiếp tục xử lý route
    } catch (error) {
        console.error("Token verification error:", error.message);

        // Chuyển hướng đến /signup nếu token không hợp lệ
        return res.redirect("/signup");
    }
};