
const express = require('express');
const {
  getActionLogs,
  getAuditTypes
} = require('../controllers/actionLogController');

const router = express.Router();

router.get('/', getActionLogs);
router.get('/types', getAuditTypes);

module.exports = router;

