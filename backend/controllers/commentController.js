const Comment = require('../models/comment');
const Audit = require('../models/audit');

// Create a comment
exports.addComment = async (req, res) => {
  try {
    const { auditId, comment, author } = req.body;

    const audit = await Audit.findById(auditId);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    const newComment = new Comment({
      comment,
      author,
      audit: auditId,
      createdAt: new Date()
    });

    const savedComment = await newComment.save();

    audit.comments.push(savedComment._id);
    await audit.save();

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { comment },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Comment not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await Audit.findByIdAndUpdate(comment.audit, {
      $pull: { comments: comment._id }
    });

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments for a specific audit
exports.getCommentsByAudit = async (req, res) => {
  try {
    const comments = await Comment.find({ audit: req.params.auditId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
