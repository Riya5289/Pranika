const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalUserSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  hospitalType: { type: String, enum: ['Government','Private','Trust','Clinic'], default: 'Private' },
  specialties: [{ type: String }],
  distance: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
  registeredHospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }
}, { timestamps: true });

hospitalUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

hospitalUserSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

hospitalUserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('HospitalUser', hospitalUserSchema);