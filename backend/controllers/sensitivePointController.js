const SensitivePoint = require("../models/sensitivePoint");

exports.createSensitivePoint = async (req, res) => {
  try {
    const { outcomeID, description } = req.body;
    const newSensitivePoint = new SensitivePoint({ outcomeID, description });

    await newSensitivePoint.save();
    res.status(201).json({ message: "Sensitive point recorded", sensitivePoint: newSensitivePoint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSensitivePointByOutcome = async (req, res) => {
  try {
    const sensitivePoints = await SensitivePoint.find({ outcomeID: req.params.outcomeID });
    res.json(sensitivePoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
