const Outcome = require("../models/outcome");
const Strength = require('../models/strength');
const NonConformity = require('../models/nonConformity');
const OFI = require('../models/ofi');
const SensitivePoint = require('../models/sensitivePoint');
const CAP = require('../models/cap');

exports.createOutcome = async (req, res) => {
  try {
    const { auditId, type } = req.body;
    const newOutcome = new Outcome({ auditId, type });

    await newOutcome.save();
    res.status(201).json({ 
      message: "Outcome created successfully", 
      outcome: newOutcome 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getOutcomesByAudit = async (req, res) => {
  try {
    const outcomes = await Outcome.find({ auditId: req.params.auditId });

    const outcomesWithDetails = await Promise.all(
      outcomes.map(async (outcome) => {
        let details;

        switch (outcome.type) {
          case 'strength':
            details = await Strength.findOne({ outcomeId: outcome._id });
            break;

          case 'nc':
            details = await NonConformity.findOne({ outcomeId: outcome._id }).lean();
            if (details) {
              const cap = await CAP.findOne({ ncId: details._id }).lean();
              details.cap = cap || null;
            }
            break;

          case 'ofi':
            details = await OFI.findOne({ outcomeId: outcome._id });
            break;

          case 'sensitivepoint':
            details = await SensitivePoint.findOne({ outcomeId: outcome._id });
            break;
        }

        return {
          ...outcome.toObject(),
          details,
        };
      })
    );

    res.json(outcomesWithDetails);
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
    const outcomeId = req.params.id;
    const outcome = await Outcome.findById(outcomeId);
    if (!outcome) return res.status(404).json({ message: "Outcome not found" });

    if (outcome.type === 'strength') {
      await Strength.findOneAndDelete({ outcomeId });
    } else if (outcome.type === 'ofi') {
      await OFI.findOneAndDelete({ outcomeId });
    } else if (outcome.type === 'nc') {
      const nc = await NonConformity.findOne({ outcomeId });
      if (nc) {
        await CAP.findOneAndDelete({ ncId: nc._id });
        await NonConformity.findOneAndDelete({ outcomeId });
      }
    } else if (outcome.type === 'sensitivepoint') {
      await SensitivePoint.findOneAndDelete({ outcomeId });
    }

    await Outcome.findByIdAndDelete(outcomeId);

    res.status(200).json({ message: "Outcome and related data deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
