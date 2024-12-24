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
    getUserProfile,
    followUser,
    unfollowUser,
} from "../controllers/userController.js";
import { protectRoute } from "./protectRoute.js";

const router = Router();

router.post("/signup", createUser);
router.post("/signin", loginUser);
router.get("/email-authentication/:token", verifyEmail);
router.post("/save-user", saveUser);
router.post("/forgot-password", requestPasswordReset);
// Route xử lý logic reset password
router.get("/reset-password/:token", resetPassword);

// Route to get user profile
router.get("/profile", protectRoute, getProfile);

router.get("/edit-profile", protectRoute, editProfile);
router.post("/edit-profile", protectRoute, updateProfile); // Handle form submission with POST

router.get("/profile/:userId", protectRoute, getUserProfile);

router.post("/follow/:userId", protectRoute, followUser);
router.post("/unfollow/:userId", protectRoute, unfollowUser);

export default router;
