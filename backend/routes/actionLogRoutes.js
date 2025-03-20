const express = require("express");
const router = express.Router();
const actionLogController = require("../controllers/actionLogController");

router.post("/", actionLogController.logAction);
router.get("/:id", actionLogController.getLogsByUser);

module.exports = router;
