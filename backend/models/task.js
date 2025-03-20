const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  auditID: { type: mongoose.Schema.Types.ObjectId, ref: "Audit", required: true },
  task: { type: String, required: true },
  status: { type: String, enum: ["completed", "ongoing", "pending"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
