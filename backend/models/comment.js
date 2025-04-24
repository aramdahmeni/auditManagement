const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  audit: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" }
});

module.exports = mongoose.model("Comment", CommentSchema);
