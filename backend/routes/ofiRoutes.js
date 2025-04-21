const express = require("express");
const router = express.Router();
const ofiController = require("../controllers/ofiController");

router.post("/", ofiController.createOFI);
router.get("/:outcomeID", ofiController.getOFIByOutcome);
router.put("/edit/:id", ofiController.updateofi);
module.exports = router;
