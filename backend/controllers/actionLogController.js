const ActionLog = require("../models/actionLog");

exports.logAction = async (req, res) => {
  try {
    const { userID, auditID, action } = req.body;
    const newLog = new ActionLog({ userID, auditID, action, dateTime: new Date() });

    await newLog.save();
    res.status(201).json({ message: "Action logged successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLogsByUser = async (req, res) => {
  try {
    const logs = await ActionLog.find({ userID: req.params.userID });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
