const express = require('express');
const router = express.Router();
const actionLogController = require("../controllers/actionLogController")


router.get('/', actionLogController.getAllLogs);
router.get('/audit/:auditId', actionLogController.getLogsByAuditId);
router.get('/user/:userId', actionLogController.getLogsByUserId);


module.exports = router;
