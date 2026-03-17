const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  patientInfo: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    condition: { type: String, required: true },
    medicalHistory: { type: String }
  },
  fromHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  toHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  medicalNotes: { type: String },
  attachments: [{
    filename: { type: String },
    path: { type: String },
    mimetype: { type: String },
    size: { type: Number }
  }],
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
