const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  icuBeds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
  generalBeds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
  ventilators: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
  oxygen: {
    type: String,
    enum: ['Available', 'Limited', 'Unavailable'],
    default: 'Available'
  },
  lastUpdated: { type: Date, default: Date.now }
,
specialists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialist' }],
updatedByHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalUser' }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
