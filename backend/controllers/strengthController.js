const Strength = require("../models/strength");

exports.createStrength = async (req, res) => {
  try {
    const { outcomeID, description } = req.body;
    const newStrength = new Strength({ outcomeID, description });

    await newStrength.save();
    res.status(201).json({ message: "Strength recorded", strength: newStrength });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStrengthByOutcome = async (req, res) => {
  try {
    const strengths = await Strength.find({ outcomeID: req.params.outcomeID });
    res.json(strengths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
