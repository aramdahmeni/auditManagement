const Comment = require("../models/comment");
const Audit = require("../models/audit");

exports.addComment = async (req, res) => {
  try {
    const { auditId, comment, author } = req.body;
    const audit = await Audit.findById(auditId);

    if (!audit) return res.status(404).json({ message: "Audit not found" });

    const newComment = new Comment({ comment, author, auditId });
    const savedComment = await newComment.save();

    audit.comments.push(savedComment._id);
    await audit.save();

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { comment: req.body.comment },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Comment not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the comment
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove comment reference from audit
    await Audit.findByIdAndUpdate(comment.auditId, {
      $pull: { comments: id }
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getCommentsByAudit = async (req, res) => {
  try {
    const comments = await Comment.find({ auditId: req.params.auditId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
