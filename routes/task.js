const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Task = require("../models/task");
const { verifyToken } = require("./auth");

//  CREATE TASK
router.post("/create-task", verifyToken, async (req, res) => {
  try {
    const { title, desc } = req.body;

    // Get the user ID from the decoded token
    const id = req.user.id;

    console.log("Creating task for User ID:", id); // Debug log

    // Check if ID exists from the token
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create and save task
    const newTask = new Task({
      title,
      desc,
      userId: id,
    });

    const saveTask = await newTask.save();

    // Update user
    await User.findByIdAndUpdate(id, { $push: { tasks: saveTask._id } });

    res.status(200).json({ message: "Task Created", task: saveTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get-All-Tasks
router.get("/get-all-tasks", verifyToken, async (req, res) => {
  try {
    const id = req.user.id;

    console.log("Fetching tasks for User ID:", id); // Debug log

    // Check if user exists and get their tasks
    const userData = await User.findById(id).populate({
      path: "tasks",
      options: { sort: { createdAt: -1 } },
    });

    if (!userData) {
      console.log("User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Found ${userData.tasks.length} tasks for user`); // Debug log
    res.status(200).json({ data: userData.tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Delete Task
router.delete("/delete-task/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const userId = req.user.id; // Get user ID from token

    console.log(`Deleting task ${id} for user ${userId}`); // Debug log

    // Delete task
    await Task.findByIdAndDelete(id);

    // Remove task ID from user's tasks array
    await User.findByIdAndUpdate(userId, { $pull: { tasks: id } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Update Task
router.put("/update-task/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const { title, desc } = req.body; // Extract values from request body
    const userId = req.user.id; // Get user ID from token

    console.log(`Updating task ${id} for user ${userId}`); // Debug log

    // Validate Task ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Check if the task exists and belongs to the user
    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    // Update task fields (only update if provided)
    task.title = title || task.title;
    task.desc = desc || task.desc;

    // Save the updated task
    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});
router.put("/update-imp-task/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 🛠️ Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      console.log("Task not found for ID:", id);
      return res.status(404).json({ message: "Task not found" });
    }

    // Toggle 'important' field
    task.important = !task.important;
    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating important task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update-complete-task/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const userId = req.user.id; // Get user ID from token

    console.log(`Updating task ${id} as completed for user ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    // Toggle the completed status
    task.isCompleted = !task.isCompleted;

    await task.save();

    res.status(200).json({ message: "Task marked as completed", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Important Tasks

router.get("/important-tasks", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const importantTasks = await Task.find({ userId, isImportant: true });

    res.status(200).json({ data: importantTasks });
  } catch (error) {
    console.error("Error fetching important tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Completed Tasks
router.get("/completed-tasks", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const completedTasks = await Task.find({ userId, isCompleted: true });

    res.status(200).json({ data: completedTasks });
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/incomplete-tasks", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const incompleteTasks = await Task.find({ userId, isCompleted: false });

    res.status(200).json({ data: incompleteTasks });
  } catch (error) {
    console.error("Error fetching incomplete tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
