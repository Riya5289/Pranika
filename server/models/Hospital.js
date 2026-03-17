const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  specialties: [{ type: String }],
  hospitalType: {
    type: String,
    enum: ['Government', 'Private', 'Trust', 'Clinic'],
    default: 'Private'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
