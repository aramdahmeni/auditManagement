const mongoose = require("mongoose");

const NonConformitySchema = new mongoose.Schema({
    outcomeID: { type: mongoose.Schema.Types.ObjectId, ref: "Outcome", required: true },
  type: { type: String, enum: ["Major", "Minor"], required: true },
  description: { type: String, required: true },
  rootCause: { type: String, required: true },
  impactedAsset: { type: String, required: true },
  preventiveAction: { type: String },
  cap: { type: mongoose.Schema.Types.ObjectId, ref: "CAP" }
}, { timestamps: true });

module.exports = mongoose.model("NonConformity", NonConformitySchema);
