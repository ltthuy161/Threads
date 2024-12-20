import express from "express";
import { connectDB } from "./config/db.js"; // Adjust the path if necessary
import dotenv from "dotenv";
import userRoutes from "./routes/userRoute.js";

const app = express();
app.use(express.json()); // Middleware để parse JSON từ request body
dotenv.config();

// Middleware
app.use(express.json());

// Connect to the database
connectDB();

// Sử dụng các route
app.use("/api/users", userRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
