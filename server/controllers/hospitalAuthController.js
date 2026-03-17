const jwt = require('jsonwebtoken');
const HospitalUser = require('../models/HospitalUser');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const { validateCaptcha } = require('../utils/captcha');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.hospitalSignup = async (req, res) => {
  try {
    const {
      hospitalName, email, password, confirmPassword,
      phone, address, hospitalType, specialties,
      lat, lng, captchaId, captchaAnswer
    } = req.body;

    const captchaResult = validateCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.valid)
      return res.status(400).json({ success: false, message: captchaResult.reason });

    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    const existing = await HospitalUser.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    // Create hospital user account
    const hospitalUser = await HospitalUser.create({
      hospitalName, email, password, phone, address,
      hospitalType,
      specialties: Array.isArray(specialties) ? specialties : specialties?.split(',').map(s => s.trim()).filter(Boolean)
    });

    // Auto-create Hospital record + blank Resource record
    const hospital = await Hospital.create({
      name: hospitalName, address, contact: { phone, email },
      specialties: hospitalUser.specialties,
      hospitalType,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

    await Resource.create({
      hospitalId: hospital._id,
      icuBeds: { total: 0, available: 0 },
      generalBeds: { total: 0, available: 0 },
      ventilators: { total: 0, available: 0 },
      oxygen: 'Unavailable',
      updatedByHospital: hospitalUser._id
    });

    hospitalUser.registeredHospitalId = hospital._id;
    await hospitalUser.save();

    res.status(201).json({ success: true, message: 'Hospital registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.hospitalLogin = async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body;

    const captchaResult = validateCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.valid)
      return res.status(400).json({ success: false, message: captchaResult.reason });

    const hospitalUser = await HospitalUser.findOne({ email }).select('+password');
    if (!hospitalUser || !(await hospitalUser.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = signToken(hospitalUser._id, 'hospital');
    res.json({
      success: true, token,
      hospital: {
        id: hospitalUser._id,
        hospitalName: hospitalUser.hospitalName,
        email: hospitalUser.email,
        hospitalId: hospitalUser.registeredHospitalId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};