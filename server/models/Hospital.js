const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  specialties: [{ type: String }],
  hospitalType: {
    type: String,
    enum: ['Government', 'Private', 'Trust', 'Clinic'],
    default: 'Private'
  },
  distance: { type: Number, default: 0 }, // in km
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
