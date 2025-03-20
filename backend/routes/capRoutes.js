const express = require("express");
const router = express.Router();
const capController = require("../controllers/capController");

router.post("/", capController.createCAP);
router.get("/", capController.getAllCAPs);
router.get("/:ncID", capController.getCAPsByNC);
router.put("/:id", capController.updateCAP);
router.delete("/:id", capController.deleteCAP);

module.exports = router;
