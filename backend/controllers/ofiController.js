const OFI = require("../models/ofi");

exports.createOFI = async (req, res) => {
  try {
    const { outcomeID, description, recommendation } = req.body;
    const newOFI = new OFI({ outcomeID, description, recommendation });

    await newOFI.save();
    res.status(201).json({ message: "OFI recorded", ofi: newOFI });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOFIByOutcome = async (req, res) => {
  try {
    const ofis = await OFI.find({ outcomeID: req.params.outcomeID });
    res.json(ofis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
