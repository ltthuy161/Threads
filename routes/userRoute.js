import { Router } from "express";
import {
    createUser,
    loginUser,
    verifyEmail,
    saveUser,
    requestPasswordReset,
    resetPassword,
    getProfile,
    editProfile,
    updateProfile,
} from "../controllers/userController.js";

const router = Router();

router.post("/signup", createUser);
router.post("/signin", loginUser);
router.get("/email-authentication/:token", verifyEmail);
router.post("/save-user", saveUser);

// Route gửi email reset password
router.post("/request-password-reset", requestPasswordReset);

// Route hiển thị form reset password
router.get("/reset-password/:token", resetPassword);

// Route xử lý lưu mật khẩu mới
router.post("/reset-password/:token", resetPassword);

// Route to get user profile
router.get("/profile", getProfile);

router.get("/edit-profile", editProfile);
router.post("/edit-profile", updateProfile); // Handle form submission with POST

export default router;
