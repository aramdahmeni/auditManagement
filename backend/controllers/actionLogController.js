const ActionLog = require('../models/actionLog');
const mongoose = require('mongoose');

exports.getActionLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, action, startDate, endDate } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (action) query.action = action;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [logs, total] = await Promise.all([
      ActionLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('userID', 'name email')
        .populate('auditID', 'title'),
      ActionLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

exports.getAuditTypes = async (req, res) => {
  try {
    const types = await ActionLog.distinct('type');
    res.json(types);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
