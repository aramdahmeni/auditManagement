const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  auditId: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" }
}, { timestamps: true });


module.exports = mongoose.model("Comment", CommentSchema);
