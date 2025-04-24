const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentController');

router.post('/add', commentsController.addComment);
router.put('/:id', commentsController.updateComment);
router.delete('/:id', commentsController.deleteComment);
router.get('/audit/:auditId', commentsController.getCommentsByAudit);

module.exports = router;
