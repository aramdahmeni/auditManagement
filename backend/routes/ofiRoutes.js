const express = require("express");
const router = express.Router();
const ofiController = require("../controllers/ofiController");

router.post("/", ofiController.createOFI);
router.get("/:outcomeID", ofiController.getOFIByOutcome);

module.exports = router;
