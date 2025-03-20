const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/", taskController.createTask);
router.get("/:auditID", taskController.getTasksByAudit);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
