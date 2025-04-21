const mongoose = require("mongoose");

const SensitivePointSchema = new mongoose.Schema({
    outcomeId: { type: mongoose.Schema.Types.ObjectId, ref: "Outcome", required: true },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("SensitivePoint", SensitivePointSchema);
