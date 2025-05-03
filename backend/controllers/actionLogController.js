const actionLog = require('../models/actionLog');

// Get all logs (optional: with filters for admin)
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await actionLog.find()
      .populate('userId', 'name email') 
      .populate('auditId', 'type status') 
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

// Get logs for a specific audit
exports.getLogsByAuditId = async (req, res) => {
  try {
    const logs = await actionLog.find({ auditId: req.params.auditId })
      .populate('userId', 'name')
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs for this audit' });
  }
};

// Get logs by user
exports.getLogsByUserId = async (req, res) => {
  try {
    const logs = await actionLog.find({ userId: req.params.userId })
      .populate('auditId', 'type')
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs for this user' });
  }
};

