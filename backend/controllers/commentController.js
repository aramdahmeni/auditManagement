const Comment = require('../models/comment');
const Audit = require('../models/audit');

// Create a comment
exports.addComment = async (req, res) => {
  try {
    const { auditId, comment, author } = req.body;

    // Check if the audit exists
    const audit = await Audit.findById(auditId);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    // Create a new comment
    const newComment = new Comment({
      comment,
      author,
      auditId, // Kept as auditId to match schema
    });

    // Save the comment
    const savedComment = await newComment.save();

    // Add the new comment to the audit's comments array
    audit.comments.push(savedComment._id);
    await audit.save();

    // Respond with the saved comment
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

    // Remove the comment from the audit's comments array
    await Audit.findByIdAndUpdate(comment.auditId, {
      $pull: { comments: comment._id }
    });

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments for a specific audit
exports.getCommentsByAudit = async (req, res) => {
  try {
    // Fetch all comments for the audit using auditId
    const comments = await Comment.find({ auditId: req.params.auditId }) // Matches schema
      .populate('author', 'name email') // Populate with author details
      .sort({ createdAt: -1 }); // Sort comments by creation date

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
