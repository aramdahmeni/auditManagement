const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema({
  type: { type: String, required: true },
  objective: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Completed", "Ongoing", "Pending"], default: "pending" },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  comment: { type: String },
  document: { type: String }, 
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
}, { timestamps: true });

module.exports = mongoose.model("Audit", AuditSchema);
