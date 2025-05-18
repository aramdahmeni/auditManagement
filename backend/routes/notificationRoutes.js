const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/pending", notificationController.getPendingAudits);

router.get("/upcoming", notificationController.getUpcomingAudits);

router.get("/ongoing-ending-soon", notificationController.getOngoingEndingSoon);

router.get("/completed-major-nc", notificationController.getCompletedWithMajorNonConformities);

router.get("/cap-deadline", notificationController.getCAPsWithCloseDeadline);

router.get("/nc-without-cap", notificationController.getNCsWithoutCAP);

router.get("/completed-no-outcomes", notificationController.getCompletedWithoutOutcomes);
module.exports = router;
