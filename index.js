import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoute.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
// Tạo `__dirname` cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình thư mục tĩnh
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json()); // Middleware để parse JSON từ request body
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to the database
connectDB();

// Cấu hình view engine Handlebars
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
    res.locals.layout = "layouts/layout"; // Đường dẫn đến layout mặc định
    next();
});

app.get("/", (req, res) => {
    res.render("init", {
        title: "Threads - Welcome",
    });
});

app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Sign Up",
        hasSidebar: false, // Không có sidebar
        css: "/css/signup.css",
    });
});

app.use("/", userRoutes);

app.get("/signin", (req, res) => {
    res.render("signin", {
        title: "Sign In",
        hasSidebar: false, // Không có sidebar
        css: "/css/signin.css",
    });
});

app.get("/forgot-password", (req, res) => {
    res.render("forgot-pw", {
        title: "Forgot Password",
        hasSidebar: false, // Không có sidebar
        css: "/css/forgot-pw.css",
    });
});

app.get("/email-authentication", (req, res) => {
    res.render("email-authentication", {
        title: "Email Authentication",
        hasSidebar: false, // Không có sidebar
        css: "/css/email-authentication.css",
    });
});

app.get("/posting", (req, res) => {
    res.render("posting", {
        title: "Posting",
        hasSidebar: true,
        css: "/css/posting.css",
        js: "/js/showPopup.js",
    });
})

app.get("/notification", (req, res) => {
    res.render("notification", {
        title: "Notification",
        hasSidebar: true,
        css: "/css/notification.css",
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        title: "Threads - Profile",
        css: "/css/profile.css",
        hasSidebar: false,
    });
});

app.get("/edit-profile", (req, res) => {
    res.render("edit-profile", {
        title: "Edit Profile",
        css: "/css/edit-profile.css",
        hasSidebar: false,
    });
});

app.get("/following", (req, res) => {
    res.render("following", {
        title: "Following",
        css: "/css/following.css",
        hasSidebar: false,
    });
});

app.get("/follower", (req, res) => {
    res.render("follower", {
        title: "Follower",
        css: "/css/follower.css",
        hasSidebar: false,
    });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
