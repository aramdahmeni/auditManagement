const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const upload = require("../middleware/multerConfig");



router.post("/add", upload.single('report'), auditController.createAudit); 
router.get("/", auditController.getAllAudits); 
router.get("/:id", auditController.getAuditById); 
router.put("/update/:id", upload.single('report'), auditController.updateAudit);
router.delete("/delete/:id", auditController.deleteAudit); 
router.patch('/:id', auditController.updateTask);
module.exports = router;
