const Audit = require('../models/audit');
const Outcome = require('../models/outcome');
const NonConformity = require('../models/nonConformity');

// 🔴 Pending audits
exports.getPendingAudits = async (req, res) => {
  try {
    const audits = await Audit.find({ status: 'Pending' });
    const notifications = audits.map((audit) => ({
      message: `Audit "${audit.objective}" is pending.`,
      auditId: audit._id,
      status: audit.status,
    }));
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🔵 Audits starting in 3 days
exports.getUpcomingAudits = async (req, res) => {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);

    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const audits = await Audit.find({ startDate: { $gte: start, $lte: end } });
    const notifications = audits.map((audit) => ({
      message: `Audit "${audit.objective}" starts in 3 days.`,
      auditId: audit._id,
      startDate: audit.startDate
    }));
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🟡 Ongoing audits ending in 3 days
exports.getOngoingEndingSoon = async (req, res) => {
  try {
    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + 3);

    const start = new Date(target.setHours(0, 0, 0, 0));
    const end = new Date(target.setHours(23, 59, 59, 999));

    const audits = await Audit.find({
      status: 'Ongoing',
      endDate: { $gte: start, $lte: end }
    });

    const notifications = audits.map((audit) => ({
      message: `Audit "${audit.objective}" in progress ends in 3 days.`,
      auditId: audit._id,
      endDate: audit.endDate
    }));

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🔶 Completed audits with major non-conformities
exports.getCompletedWithMajorNonConformities = async (req, res) => {
  try {
    const completedAudits = await Audit.find({ status: 'Completed' });
    const notifications = [];

    for (const audit of completedAudits) {
      const outcomes = await Outcome.find({ auditId: audit._id, type: 'nc' });

      if (outcomes.length > 0) {
        const majorNCs = await NonConformity.find({
          outcomeId: { $in: outcomes.map(o => o._id) },
          type: 'Major'
        });

        if (majorNCs.length > 0) {
          notifications.push({
            message: `⚠️ Audit "${audit.objective}" presents a risk with ${majorNCs.length} major non-conformity(ies).`,
            auditId: audit._id,
            status: audit.status,
            endDate: audit.endDate,
            majorNCCount: majorNCs.length
          });
        }
      }
    }

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
