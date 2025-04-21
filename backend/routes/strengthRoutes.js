const express = require("express");
const router = express.Router();
const strengthController = require("../controllers/strengthController");

router.post("/", strengthController.createStrength);
router.get("/:outcomeID", strengthController.getStrengthByOutcome);
router.put("/edit/:id", strengthController.updateStrength);
module.exports = router;
