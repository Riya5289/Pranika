const jwt = require('jsonwebtoken');
const HospitalUser = require('../models/HospitalUser');

const protectHospital = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];

    if (!token)
      return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'hospital')
      return res.status(403).json({ success: false, message: 'Not a hospital account' });

    req.hospitalUser = await HospitalUser.findById(decoded.id);
    if (!req.hospitalUser)
      return res.status(401).json({ success: false, message: 'Hospital user not found' });

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

module.exports = { protectHospital };