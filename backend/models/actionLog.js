const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  auditID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit',
    required: false
  },
  type: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ["Completed", "Ongoing", "Pending"],
    default: "Pending",
    required: false
  },
  elementId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

actionLogSchema.pre('save', async function(next) {
  if (this.auditID && (this.isNew || this.isModified('auditID'))) {
    try {
      const audit = await mongoose.model('Audit')
        .findById(this.auditID)
        .select('type status')
        .lean();

      if (audit) {
        
        if (!this.type && audit.type) {
          this.type = audit.type;
        }

        if (!this.status) {
          if (audit.type === "COMPLETED") {
            this.status = "Completed"; 
          } else if (audit.type === "Ongoing") {
            this.status = "Ongoing"; 
          } else {
            this.status = "Pending"; 
          }
        }
      }
    } catch (error) {
      console.error('Error during audit synchronization:', error);
    }
  }
  next();
});

actionLogSchema.index({ auditID: 1 });
actionLogSchema.index({ status: 1 });
actionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActionLog', actionLogSchema);
