const Audit = require("../models/audit");
const path = require("path");

const multer = require("multer");
const mongoose = require("mongoose");
const gridfsStream = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");

const mongoURI = "mongodb+srv://aramdahmeni10:admin@project.tojmv.mongodb.net/project?retryWrites=true&w=majority&appName=project";

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = gridfsStream(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = Date.now() + "_" + file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: "uploads", // Must match GridFS collection
      };
      resolve(fileInfo);
    });
  },
});
const upload = multer({ storage });



exports.createAudit = async (req, res) => {
  try {
    const { type, objective, createdBy, status, startDate, endDate, comment } = req.body;

    let documentId = null; 
    if (req.file) {
      documentId = req.file.id;
    }

    const newAudit = new Audit({ 
      type, objective, createdBy, status, startDate, endDate, comment, document: documentId 
    });

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




exports.updateAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    const updateData = { ...req.body };

    // Handle document update
    if (req.file) {
      console.log("New file uploaded:", req.file);

      // If using GridFS, delete old file
      if (audit.document && gfs) {
        try {
          await gfs.files.deleteOne({ _id: audit.document });
          console.log("Previous document deleted:", audit.document);
        } catch (err) {
          console.error("Error deleting previous document:", err);
        }
      }

      // Save new document reference
      updateData.document = req.file.id || req.file.filename;
    }

    const updatedAudit = await Audit.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ message: "Audit updated successfully", audit: updatedAudit });
  } catch (error) {
    console.error("Error updating audit:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    // Delete file from GridFS
    if (audit.document) {
      await gfs.files.deleteOne({ _id: audit.document });
    }

    await Audit.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
