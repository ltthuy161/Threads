import express from "express";
import { connectDB } from "./config/db.js"; 
import hbs from "hbs";
import dotenv from "dotenv";

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

// Connect to the database
connectDB();

// Cấu hình view engine Handlebars
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));


// Sử dụng các route

app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
    res.render("init", {
        title: "Threads - Welcome",
    });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
