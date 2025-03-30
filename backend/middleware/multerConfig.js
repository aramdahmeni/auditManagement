const multer = require("multer");
const path = require("path");

// Storage configuration for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be stored in the 'uploads/' directory
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Rename the file with a timestamp to avoid duplicates
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

// File filter to validate uploaded files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "text/plain"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only PDF and text files are allowed."), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

module.exports = upload;
