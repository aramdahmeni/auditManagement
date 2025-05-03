const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  auditId: {type: Schema.Types.ObjectId,ref: 'Audit', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User',   required: true },
  action: {  type: String, enum: ['create', 'update', 'delete'], required: true},
  timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
