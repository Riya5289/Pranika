const mongoose = require('mongoose');

const resourceLogSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalUser', required: true },
  resourceType: {
    type: String,
    enum: ['ICU Bed', 'General Bed', 'Ventilator', 'Oxygen', 'Specialist'],
    required: true
  },
  action: { type: String, enum: ['taken', 'returned', 'updated'], required: true },
  previousValue: { type: mongoose.Mixed },
  newValue: { type: mongoose.Mixed },
  takenBy: { type: String }, // name/id of person who took the equipment
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ResourceLog', resourceLogSchema);