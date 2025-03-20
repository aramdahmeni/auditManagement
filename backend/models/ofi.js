const mongoose = require("mongoose");

const OFISchema = new mongoose.Schema({
    outcomeID: { type: mongoose.Schema.Types.ObjectId, ref: "Outcome", required: true },
  perspective: { type: String, required: true },
  impactedAsset: { type: String, required: true },
  correctivePlan: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("OFI", OFISchema);
