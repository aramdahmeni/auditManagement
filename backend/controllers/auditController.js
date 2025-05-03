const Audit = require("../models/audit");
const Task = require('../models/task');
const Comment = require('../models/comment'); 
const upload = require("../middleware/multerConfig");
const actionLog = require("../models/actionLog");

exports.createAudit = async (req, res) => {
  try {
    const { type, objective, startDate, endDate, status, createdBy } = req.body;
    let parsedTasks = [];
    try {
      parsedTasks = JSON.parse(req.body.tasks || "[]");
      if (!Array.isArray(parsedTasks)) throw new Error();
    } catch {
      return res.status(400).json({ error: "Invalid tasks format" });
    }
    const newAudit = new Audit({ type,objective,startDate,endDate,status,createdBy, report: req.file ? req.file.filename : null,
      tasks: [],comments: [],});

    const savedAudit = await newAudit.save();
      await new actionLog({
        auditId: savedAudit._id,
        userId: savedAudit.createdBy,
        action: 'create',
      }).save();
    const taskPromises = parsedTasks.map(taskData =>
      new Task({
        auditID: savedAudit._id,
        task: taskData.task,
        status: taskData.status || 'pending',
        completionDate:
          taskData.status === 'completed' && taskData.completionDate
            ? new Date(taskData.completionDate)
            : null,
      }).save()
    );
    const savedTasks = await Promise.all(taskPromises);
    savedAudit.tasks = savedTasks.map(task => task._id);
    await savedAudit.save();

    const result = await Audit.findById(savedAudit._id)
      .populate("tasks")
      .populate("createdBy", "name email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email",
        },
      });

    res.status(201).json(result);
  } catch (error) {
    console.error("Audit creation error:", error);
    res.status(500).json({ error: "Audit creation failed" });
  }
};


// update task 
exports.updateTask = async (req, res) => {
  try {
    const { taskId, status, completionDate } = req.body;
    const task = await Task.findById(taskId).populate("auditID");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.auditID.status === "pending" && status !== task.status) {
      return res.status(400).json({ message: "Cannot update task status when audit status is pending" });
    }
    if (status === "completed" && !completionDate) {
      return res.status(400).json({ message: "Completion date is required when task is completed" });
    }

    task.status = status;
    task.completionDate = completionDate || task.completionDate;
    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all audits with task details
exports.getAllAudits = async (req, res) => {
  try {
    const audits = await Audit.find()
      .populate("createdBy", "name email")
      .populate("tasks")
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single audit by ID with tasks and comments
exports.getAuditById = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate({
        path: "tasks",
        select: "task status completionDate createdAt updatedAt" // Explicitly include fields
      })
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name email' }
      });

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.updateAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    const updateData = {
      type: req.body.type,
      objective: req.body.objective,
      status: req.body.status,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      report: req.file ? req.file.filename : req.body.report
    };

    await Audit.findByIdAndUpdate(req.params.id, updateData);
    await new actionLog({
      auditId: req.params.id,
      userId: audit.createdBy,
      action: 'update',
    }).save();
    const fresh = await Audit.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("tasks", "task status completionDate createdAt updatedAt")
      .populate({ path: "comments", populate: { path: "author", select: "name email" } });

    res.json({ message: "Audit updated", audit: fresh });
  } catch (err) {
    console.error("Error updating audit:", err);
    res.status(500).json({ error: err.message });
  }
};


// Delete audit by ID
exports.deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    await Comment.deleteMany({ audit: audit._id });
    await Task.deleteMany({ audit: audit._id });
    await Audit.findByIdAndDelete(req.params.id);
    await new actionLog({
      auditId: req.params.id,
      userId: audit.createdBy,
      action: 'delete',
    }).save();
    res.json({ message: "Audit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

