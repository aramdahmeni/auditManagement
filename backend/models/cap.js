const mongoose = require("mongoose");

const CAPSchema = new mongoose.Schema({
  ncId: { type: mongoose.Schema.Types.ObjectId, ref: "NonConformity", required: true },
  responsible: { type: String, required: true },
  action: { type: String, required:true},
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["completed", "ongoing", "pending"], required: true },
  effectiveness: { type: String },
  completionDate:{ type: Date}
}, { timestamps: true });

module.exports = mongoose.model("CAP", CAPSchema);
