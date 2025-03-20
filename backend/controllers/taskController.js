const Task = require("../models/task");

exports.createTask = async (req, res) => {
  try {
    const { auditID, task, status } = req.body;
    const newTask = new Task({ auditID, task, status });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasksByAudit = async (req, res) => {
  try {
    const tasks = await Task.find({ auditID: req.params.auditID });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};