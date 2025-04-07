const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema({
  auditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  title: { type: String, required: true },
  severity: { type: String, required: true },
  description: { type: String, required: true },
  actionPlan: { type: String },
  impactedAssets: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Outcome', outcomeSchema);