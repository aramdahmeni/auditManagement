const mongoose = require("mongoose");

const OFISchema = new mongoose.Schema({
  outcomeId: { type: mongoose.Schema.Types.ObjectId, ref: "Outcome", required: true },
    description: { type: String, required: true },
  perspective: { type: String, required: true },
  impactedAsset: { type: String, required: true },
  action: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("OFI", OFISchema);
