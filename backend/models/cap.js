const mongoose = require("mongoose");

const CAPSchema = new mongoose.Schema({
    ncID: { type: mongoose.Schema.Types.ObjectId, ref: "NonConformity", required: true },
    
  responsible: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["completed", "ongoing", "pending"], required: true },
  effectiveness: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("CAP", CAPSchema);
