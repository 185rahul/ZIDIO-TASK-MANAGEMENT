const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db"); // 1. Import the database connection

// 2. Connect to MongoDB
connectDB(); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- ROUTES ---

// Handles task organization and progress tracking
app.use("/api/tasks", require("./routes/taskRoutes"));

// Handles team members and role-based permissions
app.use("/api/users", require("./routes/userRoutes"));

// --- MAIN ENDPOINT ---

app.get("/", (req, res) => {
  res.send("Zidio Task Management Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});