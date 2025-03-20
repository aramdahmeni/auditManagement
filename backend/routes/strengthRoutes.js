const express = require("express");
const router = express.Router();
const strengthController = require("../controllers/strengthController");

router.post("/", strengthController.createStrength);
router.get("/:outcomeID", strengthController.getStrengthByOutcome);

module.exports = router;
