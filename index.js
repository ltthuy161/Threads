import express from 'express';
import expressHbs from'express-handlebars';
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoute.js";
import notiRoutes from "./routes/notiRoute.js";
import threadRoutes from './routes/threadRoute.js';
import likeRoutes from './routes/likeRoute.js';

import path from "path";


const app = express();
const __dirname = path.resolve();
// Cấu hình thư mục tĩnh
app.use(express.static(__dirname + "/public"));

app.use(express.json()); // Middleware để parse JSON từ request body
dotenv.config();

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use(cookieParser());

// Connect to the database
connectDB();

// Cấu hình view engine Handlebars
app.engine(
    'hbs', 
    expressHbs.engine({
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials",
        extname: "hbs",
        defaultLayout: "layout",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
        },
        helpers: {
            formatDate: (date) => {
                return new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
            },
            eq: (a, b) => a === b, // Đăng ký helper eq
        }
    })
);
app.set("view engine", "hbs");

app.use("/", threadRoutes);
app.use("/", userRoutes);
app.use("/", notiRoutes);
app.use("/", likeRoutes);

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

app.get('/homepage', (req, res) => {
    res.redirect('/threads/');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
