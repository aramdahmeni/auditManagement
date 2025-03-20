const NonConformity = require("../models/nonConformity");

exports.createNonConformity = async (req, res) => {
  try {
    const { outcomeID, type, description, rootCause, impactedAsset, preventiveAction, cap } = req.body;
    const newNC = new NonConformity({ outcomeID, type, description, rootCause, impactedAsset, preventiveAction, cap });

    await newNC.save();
    res.status(201).json({ message: "Non-Conformity recorded", nonConformity: newNC });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNCByOutcome = async (req, res) => {
  try {
    const nonConformities = await NonConformity.find({ outcomeID: req.params.outcomeID }).populate("cap");
    res.json(nonConformities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNonConformity = async (req, res) => {
  try {
    const updatedNC = await NonConformity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNC);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNonConformity = async (req, res) => {
  try {
    await NonConformity.findByIdAndDelete(req.params.id);
    res.json({ message: "Non-Conformity deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
