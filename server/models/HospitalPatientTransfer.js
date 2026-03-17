const mongoose = require('mongoose');

const hospitalPatientTransferSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalPatient',
    required: true
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
  transferReason: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  medicalSummary: String,
  requiredSpecialty: String,
  transferredByHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalUser'
  },
  approvedByHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalUser'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Transit', 'Completed'],
    default: 'Pending'
  },
  approvalNotes: String,
  rejectionReason: String,
  estimatedArrivalTime: Date,
  actualArrivalTime: Date,
  ambulanceDetails: {
    driverName: String,
    driverContact: String,
    ambulanceNumber: String,
    departureTime: Date
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('HospitalPatientTransfer', hospitalPatientTransferSchema);
