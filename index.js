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
import { protectRoute } from './routes/protectRoute.js';


const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const __dirname = path.resolve();
// Cấu hình thư mục tĩnh
app.use(express.static(__dirname + "/public"));

app.use(express.json()); // Middleware để parse JSON từ request body
dotenv.config();

// Middleware

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
            eq: (a, b) => a === b,
            json: (obj) => {
                if (obj === undefined || obj === null) {
                    return ""; 
                }
                try {
                    const jsonString = JSON.stringify(obj);
                    return jsonString
                        .replace(/</g, "\\u003c") 
                        .replace(/>/g, "\\u003e")
                        .replace(/&/g, "\\u0026")
                        .replace(/'/g, "\\u0027")
                        .replace(/"/g, "\\u0022");
                } catch (error) {
                    console.error("Error in JSON helper:", error, "Data:", obj);
                    return "";
                }
            },
            ifEquals: (arg1, arg2, options) => {
                return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
            },
            getDomain: (email) => {
                if (!email || typeof email !== 'string') {
                    return ''; 
                }
                const domain = email.split('@')[0]; 
                return domain ? `@${domain}` : ''; 
            }
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


app.get("/notification", (req, res) => {
    res.render("notification", {
        title: "Notification",
        hasSidebar: true,
        css: "/css/notification.css",
        activeIcon: 'noti-icon',
    });
});

app.get("/edit-profile", (req, res) => {
    res.render("edit-profile", {
        title: "Edit Profile",
        css: "/css/edit-profile.css",
        hasSidebar: false,
        activeIcon: "",

    });
});

app.get('/homepage', protectRoute, (req, res) => {
    res.redirect('/threads/');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
