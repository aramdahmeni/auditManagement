const Outcome = require("../models/outcome");

exports.createOutcome = async (req, res) => {
  try {
    const { auditID } = req.body;
    const newOutcome = new Outcome({ auditID });

    await newOutcome.save();
    res.status(201).json({ message: "Outcome created successfully", outcome: newOutcome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOutcomesByAudit = async (req, res) => {
  try {
    const outcomes = await Outcome.find({ auditID: req.params.auditID });
    res.json(outcomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOutcome = async (req, res) => {
  try {
    const updatedOutcome = await Outcome.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOutcome);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteOutcome = async (req, res) => {
  try {
    await Outcome.findByIdAndDelete(req.params.id);
    res.json({ message: "Outcome deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};