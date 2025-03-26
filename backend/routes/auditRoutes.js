const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const multer = require("multer");




router.post("/", auditController.createAudit);

router.get("/", auditController.getAllAudits);

router.get("/:id", auditController.getAuditById);
const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        cb(null, req.params.id + path.extname(file.originalname));
      },
    }),
  });
  
  router.put("/edit/:id", upload.single("document"), auditController.updateAudit);
  router.delete("/delete/:id", auditController.deleteAudit);

module.exports = router;
