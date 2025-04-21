const SensitivePoint = require("../models/sensitivePoint");

exports.createSensitivePoint = async (req, res) => {
  try {
    const { outcomeId, description } = req.body;
    const newSensitivePoint = new SensitivePoint({ outcomeId, description });

    await newSensitivePoint.save();
    res.status(201).json({ message: "Sensitive point recorded", sensitivePoint: newSensitivePoint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSensitivePointByOutcome = async (req, res) => {
  try {
    const sensitivePoints = await SensitivePoint.find({ outcomeId: req.params.outcomeId });
    res.json(sensitivePoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateSensitivePoint = async (req, res) => {
  try {
    const updatedSensitivePoint = await SensitivePoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSensitivePoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};