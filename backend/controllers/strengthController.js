const Strength = require("../models/strength");

exports.createStrength = async (req, res) => {
  try {
    console.log("Received Strength payload:", req.body);
    const { outcomeId, description } = req.body;
    const newStrength = new Strength({ outcomeId: outcomeId,  description });

    await newStrength.save();

    res.status(201).json({ message: "Strength created", strength: newStrength });
  } catch (error) {
    console.error("Error creating strength:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.getStrengthByOutcome = async (req, res) => {
  try {
    const strengths = await Strength.find({ outcomeId: req.params.outcomeId });
    res.json(strengths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStrength = async (req, res) => {
  try {
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);
    const updatedStrength = await Strength.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStrength) {
      return res.status(404).json({ message: "Strength not found" });
    }
    res.json(updatedStrength);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};
