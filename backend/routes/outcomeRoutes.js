const express = require("express");
const router = express.Router();
const outcomeController = require("../controllers/outcomeController");

router.post("/", outcomeController.createOutcome);

router.get("/", outcomeController.getOutcomesByAudit);


router.put("/:id", outcomeController.updateOutcome);

router.delete("/:id", outcomeController.deleteOutcome);

module.exports = router;
