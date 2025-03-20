const mongoose = require("mongoose");

const ActionLogSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  auditID: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" }, 
  action: { type: String, required: true },
  dateTime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ActionLog", ActionLogSchema);
