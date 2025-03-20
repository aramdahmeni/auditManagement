const express = require("express");
const router = express.Router();
const sensitivePointController = require("../controllers/sensitivePointController");

router.post("/", sensitivePointController.createSensitivePoint);
router.get("/:outcomeID", sensitivePointController.getSensitivePointByOutcome);

module.exports = router;
