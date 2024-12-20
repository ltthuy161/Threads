import express from "express";
import {connectDB} from "./config/db.js"; // Adjust the path if necessary
import dotenv from "dotenv";

const app = express();
dotenv.config();

// Middleware
app.use(express.json());

// Connect to the database
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});