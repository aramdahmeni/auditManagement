const mongoose = require('mongoose');
const Audit = require('../models/audit');
const Outcome = require('../models/outcome');
const NonConformity = require('../models/nonConformity');
const CAP = require('../models/cap');

exports.getPendingAudits = async (req, res) => {
  try {
    const audits = await Audit.find({ status: 'Pending' });
    const notifications = audits.map(audit => ({
      message: `🔴 Audit "${audit.objective}" is pending.`,
      auditId: audit._id,
      status: audit.status,
    }));
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUpcomingAudits = async (req, res) => {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);

    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const audits = await Audit.find({ startDate: { $gte: start, $lte: end } });

    const notifications = audits.map(audit => ({
      message: `🔵 Audit "${audit.objective}" starts in 3 days.`,
      auditId: audit._id,
      startDate: audit.startDate,
    }));

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getOngoingEndingSoon = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); 
    endDate.setHours(23, 59, 59, 999); 


    const audits = await Audit.find({
      status: 'Ongoing',
      endDate: { 
        $gte: today, 
        $lte: endDate  
      }
    }).sort({ endDate: 1 }); 

    
    const notifications = audits.map(audit => {
      const timeDiff = audit.endDate - today;
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      let message, priority;
      
      switch(daysRemaining) {
        case 1:
          message = `🔴 Audit "${audit.objective}" ends TOMORROW (${audit.endDate.toLocaleDateString()})`;
          priority = 1;
          break;
        case 2:
          message = `🟠 Audit "${audit.objective}" ends in 2 days (${audit.endDate.toLocaleDateString()})`;
          priority = 2;
          break;
        case 3:
          message = `🟡 Audit "${audit.objective}" ends in 3 days (${audit.endDate.toLocaleDateString()})`;
          priority = 3;
          break;
        default:
          message = `🔵 Audit "${audit.objective}" ends in ${daysRemaining} days (${audit.endDate.toLocaleDateString()})`;
          priority = 4;
      }

      return {
        message,
        auditId: audit._id,
        endDate: audit.endDate,
        daysRemaining,
        priority,
        type: 'ending-soon'
      };
    });

  
    notifications.sort((a, b) => a.priority - b.priority);

    res.status(200).json({ 
      success: true, 
      notifications,
      count: notifications.length
    });
  } catch (err) {
    console.error("Error in getOngoingEndingSoon:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};


exports.getCompletedWithMajorNonConformities = async (req, res) => {
  try {
    const completedAudits = await Audit.find({ status: 'Completed' });

    const notifications = await Promise.all(completedAudits.map(async (audit) => {
      const outcomes = await Outcome.find({ auditId: audit._id, type: 'nc' }).select('_id');

      if (outcomes.length === 0) return null;

      const outcomeIds = outcomes.map(o => o._id);

      const majorNCs = await NonConformity.find({
        outcomeId: { $in: outcomeIds },
        type: 'Major',
      });

      if (majorNCs.length === 0) return null;

      return {
        message: `⚠️ Audit "${audit.objective}" has ${majorNCs.length} major non-conformity(ies).`,
        auditId: audit._id,
        status: audit.status,
        endDate: audit.endDate,
        majorNCCount: majorNCs.length,
      };
    }));

 
    const filtered = notifications.filter(n => n !== null);

    res.status(200).json({ success: true, notifications: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getCAPsWithCloseDeadline = async (req, res) => {
  try {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    
    const caps = await CAP.find({
      dueDate: { $gte: today, $lte: threeDaysLater },
      status: { $ne: 'completed' } 
    });

    const notifications = caps.map(cap => ({
      message: `🧨 CAP for NonConformity "${cap.ncId}" is approaching its deadline (${cap.dueDate.toLocaleDateString()}).`,
      capId: cap._id,
      dueDate: cap.dueDate,
    }));

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getNCsWithoutCAP = async (req, res) => {
  try {

    const { auditId } = req.query;
    let matchStage = {};

    if (auditId) {
      if (!mongoose.Types.ObjectId.isValid(auditId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit ID"
        });
      }
      matchStage = {
        "outcome.auditId": new mongoose.Types.ObjectId(auditId)
      };
    }


    const ncsWithoutCAP = await NonConformity.aggregate([
      {
        $lookup: {
          from: "outcomes",
          localField: "outcomeId",
          foreignField: "_id",
          as: "outcome"
        }
      },
      { $unwind: "$outcome" },
      { $match: matchStage }, 
      {
        $lookup: {
          from: "caps",
          localField: "_id",
          foreignField: "ncId",
          as: "caps"
        }
      },
      {
        $match: {
          "caps": { $size: 0 } 
        }
      },
      {
        $project: {
          _id: 1,
          description: 1,
          type: 1,
          rootCause: 1,
          impactedAsset: 1,
          outcomeId: 1,
          auditId: "$outcome.auditId",
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } } 
    ]);


    const notifications = ncsWithoutCAP.map(nc => ({
      message: `🚨 ${nc.type} Non-Conformity: "${nc.description.substring(0, 50)}${nc.description.length > 50 ? '...' : ''}" without CAP`,
      details: {
        ncId: nc._id,
        auditId: nc.auditId,
        type: nc.type,
        rootCause: nc.rootCause,
        impactedAsset: nc.impactedAsset
      },
      priority: nc.type === "Major" ? 1 : 2, 
      type: "missing-cap",
      timestamp: nc.createdAt
    }));

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (err) {
    console.error("Error in getNCsWithoutCAP:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
exports.getCompletedWithoutOutcomes = async (req, res) => {
  try {

    const audits = await Audit.aggregate([
      {
        $match: { status: "Completed" } 
      },
      {
        $lookup: {
          from: "outcomes",
          localField: "_id",
          foreignField: "auditId",
          as: "outcomes"
        }
      },
      {
        $match: {
          "outcomes": { $size: 0 } 
        }
      },
      { $sort: { endDate: -1 } } 
    ]);


    const notifications = audits.map(audit => ({
      message: `📌 Audit "${audit.objective}" is completed but has no outcomes`,
      auditId: audit._id,
      auditName: audit.objective,
      endDate: audit.endDate,
      type: "completed-no-outcomes",
      actionLink: `/audits/${audit._id}/add-outcomes` 
    }));

    res.status(200).json({ 
      success: true, 
      notifications,
      count: notifications.length
    });

  } catch (err) {
    console.error("Error in getCompletedWithoutOutcomes:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};