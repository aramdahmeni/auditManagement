const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const multer = require("multer");
const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage"); // ✅ Import correctly

// MongoDB connection string
const mongoURI = "mongodb+srv://aramdahmeni10:admin@project.tojmv.mongodb.net/project?retryWrites=true&w=majority&appName=project";

// GridFS Storage Setup
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true }, // ✅ Ensure options are passed
  file: (req, file) => {
    return {
      filename: `${Date.now()}_${file.originalname}`, // Ensure unique filenames
      bucketName: "uploads", // Must match GridFS collection
    };
  },
});

const upload = multer({ storage });

// Define routes
router.post("/", auditController.createAudit); // Create Audit
router.get("/", auditController.getAllAudits); // Get All Audits
router.get("/:id", auditController.getAuditById); // Get Audit by ID
router.put("/update/:id", upload.single("document"), auditController.updateAudit); // ✅ Ensure file upload works
router.delete("/delete/:id", auditController.deleteAudit); // Delete Audit

module.exports = router;
