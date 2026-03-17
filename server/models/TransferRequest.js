const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  patientCondition: {
    type: String,
    enum: ['Critical', 'Serious', 'Stable', 'Emergency'],
    required: true
  },
  currentHospital: { type: String, required: true },
  requiredResources: [{
    type: String,
    enum: ['ICU Bed', 'Ventilator', 'Specialist', 'Emergency Surgery']
  }],
  targetHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  estimatedETA: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TransferRequest', transferSchema);
