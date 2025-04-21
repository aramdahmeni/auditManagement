const express = require("express");
const router = express.Router();
const nonConformityController = require("../controllers/nonConformitController");

router.post("/", nonConformityController.createNonConformity);

router.get("/:outcomeID", nonConformityController.getNCByOutcome);
router.put("/edit/:id", nonConformityController.updateNonConformity);
router.delete("/:id", nonConformityController.deleteNonConformity);

module.exports = router;
