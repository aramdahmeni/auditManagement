const OFI = require("../models/ofi");

exports.createOFI = async (req, res) => {
  try {
    const { outcomeId, description, perspective, impactedAsset, action } = req.body;
    const newOFI = new OFI({ outcomeId, description,perspective, impactedAsset, action});

    await newOFI.save();
    res.status(201).json({ message: "OFI recorded", ofi: newOFI });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOFIByOutcome = async (req, res) => {
  try {
    const ofis = await OFI.find({ outcomeId: req.params.outcomeId });
    res.json(ofis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateofi = async (req, res) => {
  try {
    const updatedOFI = await OFI.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOFI);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};