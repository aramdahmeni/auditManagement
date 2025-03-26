const Audit = require("../models/audit");
const path = require("path");

const multer = require("multer");


exports.createAudit = async (req, res) => {
  try {
    const { type, objective, createdBy, status, startDate, endDate, comment, document } = req.body;
    const newAudit = new Audit({ type, objective, createdBy, status, startDate, endDate, comment, document });

    await newAudit.save();
    res.status(201).json({ message: "Audit created successfully", audit: newAudit });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const audit = await Audit.findById(req.params.id).populate("createdBy", "name email");
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, req.params.id + path.extname(file.originalname)); // Use ID for unique filenames
  },
});

const upload = multer({ storage: storage });
exports.updateAudit = async (req, res) => {
  try {
    const updateData = { 
      ...req.body, // This already contains type, objective, status, etc.
      comment: req.body.comment,  // Ensure comment updates correctly
    };

    if (req.file) {
      updateData.document = req.file.path;  // Store document path if file is uploaded
      console.log("File saved at:", req.file.path);
    }

    const updatedAudit = await Audit.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },  // Use $set to update only specific fields
      { new: true, runValidators: true }
    );

    if (!updatedAudit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    res.json(updatedAudit);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

exports.deleteAudit = async (req, res) => {
  try {
    await Audit.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
