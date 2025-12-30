const Task = require('../models/Task');

// Get all tasks for logged in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = await Task.create({
      title,
      user: req.user.id,
      status: 'TO DO'
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Task creation failed" });
  }
};

// Update task (Status Cycle: TO DO -> IN PROGRESS -> DONE)
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: "Unauthorized" });

    task.status = status || task.status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Update failed" });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) return res.status(401).json({ message: "Unauthorized" });

    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};