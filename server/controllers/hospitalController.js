const Hospital = require('../models/Hospital');

exports.getHospitals = async (req, res) => {
  try {
    const { search, specialty, type, maxDistance } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialty) query.specialties = { $in: [specialty] };
    if (type) query.hospitalType = type;
    if (maxDistance) query.distance = { $lte: parseFloat(maxDistance) };

    const hospitals = await Hospital.find(query).sort({ distance: 1 });
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedHospitals = async (req, res) => {
  try {
    await Hospital.deleteMany({});
    const hospitals = [
      { name: 'AIIMS Bhopal', address: 'Saket Nagar, Bhopal, MP 462024', contact: '+91-755-2672315', specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'], hospitalType: 'Government', distance: 2.1 },
      { name: 'Hamidia Hospital', address: 'Royal Market, Bhopal, MP 462001', contact: '+91-755-2740877', specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency'], hospitalType: 'Government', distance: 3.4 },
      { name: 'Bansal Hospital', address: 'C Sector, Shahpura, Bhopal, MP 462016', contact: '+91-755-4000000', specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'IVF'], hospitalType: 'Private', distance: 5.2 },
      { name: 'Chirayu Medical College', address: 'Bhopal Bypass Road, Bairagarh, MP 462030', contact: '+91-755-6699300', specialties: ['General Medicine', 'Cardiology', 'Gynecology', 'Pediatrics'], hospitalType: 'Private', distance: 7.8 },
      { name: 'Bombay Hospital Indore', address: '201 RNT Marg, Indore, MP 452001', contact: '+91-731-4077000', specialties: ['Cardiology', 'Neurology', 'Cancer', 'Transplant'], hospitalType: 'Private', distance: 12.3 },
      { name: 'MY Hospital Indore', address: 'Near Rajwada, Indore, MP 452001', contact: '+91-731-2527412', specialties: ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics'], hospitalType: 'Government', distance: 14.5 },
      { name: 'Apollo Hospitals Indore', address: 'Scheme 94, Vijay Nagar, Indore, MP 452001', contact: '+91-731-3030000', specialties: ['Cardiology', 'Oncology', 'Nephrology', 'Transplant'], hospitalType: 'Private', distance: 15.0 },
      { name: 'Medanta Super Speciality', address: 'AB Road, Bypass Road, Indore, MP 452016', contact: '+91-731-3014444', specialties: ['Cardiac Surgery', 'Neurosurgery', 'Gastroenterology', 'Emergency'], hospitalType: 'Private', distance: 18.7 }
    ];
    await Hospital.insertMany(hospitals);
    res.json({ success: true, message: `${hospitals.length} hospitals seeded` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
