const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  availableDays: [{ type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }],
  availableFrom: { type: String }, // e.g. "09:00"
  availableTo: { type: String },   // e.g. "17:00"
  isAvailableToday: { type: Boolean, default: true },
  contact: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Specialist', specialistSchema);