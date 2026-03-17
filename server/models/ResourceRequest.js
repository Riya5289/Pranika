const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  requestingHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  requestedFromHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['icuBeds', 'generalBeds', 'ventilators', 'oxygen'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  reason: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  approvedQuantity: {
    type: Number,
    default: null
  },
  rejectionReason: String,
  requestedByHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalUser'
  },
  approvedByHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalUser'
  },
  expectedDeliveryDate: Date,
  completedDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
