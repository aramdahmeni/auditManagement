const NonConformity = require("../models/nonConformity");
const CAP = require("../models/cap"); // import your CAP model
exports.createNonConformity = async (req, res) => {
  try {
    const { outcomeId, type, description, rootCause, impactedAsset, preventiveAction, cap } = req.body;
    const newNC = new NonConformity({ outcomeId, type, description, rootCause, impactedAsset, preventiveAction, cap });

    await newNC.save();
    res.status(201).json({ message: "Non-Conformity recorded", nonConformity: newNC });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNCByOutcome = async (req, res) => {
  try {
    const nonConformities = await NonConformity.find({ outcomeId: req.params.outcomeId }).populate("cap");
    res.json(nonConformities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.updateNonConformity = async (req, res) => {
  try {
    const { cap, ...ncData } = req.body;

    // First, update the CAP if it exists
    if (cap && cap._id) {
      await CAP.findByIdAndUpdate(cap._id, cap, { new: true });
    }

    // Now update the Non-Conformity
    const updatedNC = await NonConformity.findByIdAndUpdate(req.params.id, ncData, { new: true }).populate("cap");

    if (!updatedNC) {
      return res.status(404).json({ message: "Non-Conformity not found" });
    }

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
