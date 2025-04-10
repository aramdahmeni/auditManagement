const mongoose = require('mongoose');

const OutcomeSchema = new mongoose.Schema({
  auditId: {    type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },

}, {
  timestamps: true
});

module.exports = mongoose.model('Outcome', OutcomeSchema);
