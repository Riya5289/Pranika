const mongoose = require('mongoose');

const hospitalPatientSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  medicalHistory: String,
  admissionDate: {
    type: Date,
    default: Date.now
  },
  department: String,
  allergies: String,
  bloodGroup: String,
  status: {
    type: String,
    enum: ['Admitted', 'Under Treatment', 'Ready for Transfer', 'Transferred', 'Discharged'],
    default: 'Admitted'
  },
  notes: String,
  addedByHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalUser'
  }
}, { timestamps: true });

module.exports = mongoose.model('HospitalPatient', hospitalPatientSchema);
