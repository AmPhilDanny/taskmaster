require("dotenv").config();
/* ======================
   BACKEND: server.js (Node.js + Express + MongoDB)
   ====================== */
   const express = require("express");
   const mongoose = require("mongoose");
   const bcrypt = require("bcrypt");
   const jwt = require("jsonwebtoken");
   const cors = require("cors");
   require("dotenv").config();
   
   const app = express();
   const PORT = process.env.PORT || 5000;
   const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";
   
   // Middleware
   app.use(express.json());
   app.use(cors());
   
   // Connect to MongoDB
   mongoose.connect(process.env.MONGO_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   }).then(() => console.log("MongoDB Connected"))
     .catch(err => console.log("MongoDB Connection Error:", err));
   
   // User Schema
   const UserSchema = new mongoose.Schema({
     email: { type: String, required: true, unique: true },
     password: { type: String, required: true },
   });
   const User = mongoose.model("User", UserSchema);
   
   // Task Schema
   const TaskSchema = new mongoose.Schema({
     title: { type: String, required: true },
     description: String,
     priority: { type: String, enum: ["low", "medium", "high"], required: true },
     deadline: Date,
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   });
   const Task = mongoose.model("Task", TaskSchema);
   
   // User Registration
   app.post("/register", async (req, res) => {
     try {
       const { email, password } = req.body;
       if (!email || !password) {
         return res.status(400).json({ message: "Email and password are required" });
       }
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = new User({ email, password: hashedPassword });
       await user.save();
       res.status(201).json({ message: "User registered" });
     } catch (error) {
       res.status(500).json({ message: "Server error", error });
     }
   });
   
   // User Login
   app.post("/login", async (req, res) => {
     try {
       const { email, password } = req.body;
       const user = await User.findOne({ email });
       if (!user || !(await bcrypt.compare(password, user.password))) {
         return res.status(400).json({ message: "Invalid credentials" });
       }
       const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
       res.json({ token, userId: user._id });
     } catch (error) {
       res.status(500).json({ message: "Server error", error });
     }
   });
   
   // Create Task
   app.post("/tasks", async (req, res) => {
     try {
       const { title, description, priority, deadline, userId } = req.body;
       if (!title || !priority || !userId) {
         return res.status(400).json({ message: "Title, priority, and userId are required" });
       }
       const task = new Task({ title, description, priority, deadline, userId });
       await task.save();
       res.status(201).json(task);
     } catch (error) {
       res.status(500).json({ message: "Server error", error });
     }
   });
   
   // Get Tasks
   app.get("/tasks/:userId", async (req, res) => {
     try {
       const tasks = await Task.find({ userId: req.params.userId });
       res.json(tasks);
     } catch (error) {
       res.status(500).json({ message: "Server error", error });
     }
   });
   
   // Update Task
   app.put("/tasks/:id", async (req, res) => {
     try {
       const { title, description, priority, deadline } = req.body;
       const updatedTask = await Task.findByIdAndUpdate(req.params.id, { title, description, priority, deadline }, { new: true });
       if (!updatedTask) {
         return res.status(404).json({ message: "Task not found" });
       }
       res.json(updatedTask);
     } catch (error) {
       res.status(500).json({ message: "Server error", error });
     }
   });
   
   // Delete Task
   app.delete("/tasks/:id", async (req, res) => {
     try {
       const deletedTask = await Task.findByIdAndDelete(req.params.id);
       if (!deletedTask) {
         return res.status(404).json({ message: "Task not found" });
       }
       res.json({ message: "Task deleted" });
     } catch (error) {
       res.status(500).json({ message: "Server error", error });
     }
   });
   
   // Start Server
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   