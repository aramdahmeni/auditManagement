const Task = require("../models/task");
const Audit = require("../models/audit");

// POST /api/task
exports.createTask = async (req, res) => {
  try {
    const { auditID, task, status = 'pending' } = req.body;
    if (!auditID || !task) {
      return res.status(400).json({ error: "auditID and task are required" });
    }

    const normalizedStatus = status.toLowerCase();
    const newTask = new Task({
      auditID,
      task,
      status: normalizedStatus,
      completionDate: normalizedStatus === 'completed' ? new Date() : null
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Task creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/task/audit/:auditID
exports.getTasksByAudit = async (req, res) => {
  try {
    const tasks = await Task
      .find({ auditID: req.params.auditID })
      .sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/task/:id
exports.updateTask = async (req, res) => {
  try {
    const { task: newText, status, completionDate } = req.body;

    // Build update object
    const updateData = { task: newText, status };
    if (status === 'completed') {
      updateData.completionDate = completionDate
        ? new Date(completionDate)
        : new Date();
    } else {
      updateData.completionDate = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/task/:id
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
