const express = require("express");
const router = express.Router();
const sensitivePointController = require("../controllers/sensitivePointController");

router.post("/", sensitivePointController.createSensitivePoint);
router.get("/:outcomeID", sensitivePointController.getSensitivePointByOutcome);
router.put("/edit/:id", sensitivePointController.updateSensitivePoint);
module.exports = router;
