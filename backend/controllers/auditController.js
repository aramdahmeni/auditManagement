const Audit = require("../models/audit");
const Task = require('../models/task');
const upload = require("../middleware/multerConfig")


exports.createAudit = async (req, res) => {
  try {
    const {type,objective,startDate,endDate,status,comment,createdBy} = req.body;

    let parsedTasks = [];
    try {
      parsedTasks = JSON.parse(req.body.tasks || "[]");
      if (!Array.isArray(parsedTasks)) throw new Error();
    } catch {
      return res.status(400).json({ error: "Invalid tasks format" });
    }

    const newAudit = new Audit({ type,objective,startDate,endDate, status,comment, createdBy,document: req.file ? req.file.filename : null,
      tasks: []
    });

    const savedAudit = await newAudit.save();

    const taskPromises = parsedTasks.map(taskData =>
      new Task({
        auditID: savedAudit._id,
        task: taskData.task,
        status: taskData.status || 'pending'
      }).save()
    );

    const savedTasks = await Promise.all(taskPromises);
    savedAudit.tasks = savedTasks.map(task => task._id);
    await savedAudit.save();

    const result = await Audit.findById(savedAudit._id)
      .populate('tasks')
      .exec();

    res.status(201).json(result);
    

  } catch (error) {
    console.error("Audit creation error:", error);
    res.status(500).json({
      error: "Audit creation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




exports.getAllAudits = async (req, res) => {
  try {
    const audits = await Audit.find().populate("createdBy", "name email");
    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuditById = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id).populate("createdBy", "name email").sort({ createdAt: -1 });
    if (!audit) return res.status(404).json({ message: "Audit not found" });

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
      ...req.body,
      type: req.body.type,
      objective: req.body.objective,
      status: req.body.status,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      comment: req.body.comment
    };

    if (req.file) {
      console.log("New file uploaded:", req.file.path);
      updateData.document = req.file.path;
    } else if (req.body.documentPath === '') {

      updateData.document = '';
    }

    const updatedAudit = await Audit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ message: "Audit updated successfully", audit: updatedAudit });
  } catch (error) {
    console.error("Error updating audit:", error.stack);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    await Audit.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAuditTasks = async (req, res) => {
  try {
      const { tasks } = req.body;
      const updatedAudit = await Audit.findByIdAndUpdate(
          req.params.id,
          { $set: { tasks: tasks } },
          { new: true }
      );
      res.status(200).json(updatedAudit);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};