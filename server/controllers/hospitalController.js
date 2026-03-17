const Hospital = require('../models/Hospital');
const { calculateDistance } = require('../utils/distance');

exports.getHospitals = async (req, res) => {
  try {
    const { search, specialty, type, lat, lng } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialty) query.specialties = { $in: [specialty] };
    if (type) query.hospitalType = type;

    const hospitals = await Hospital.find(query);

    // If lat and lng provided, calculate distances and sort
    let hospitalData = hospitals;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      hospitalData = hospitals.map(hospital => ({
        ...hospital.toObject(),
        distance: calculateDistance(userLat, userLng, hospital.location.lat, hospital.location.lng)
      })).sort((a, b) => a.distance - b.distance);
    }

    res.json({ success: true, count: hospitalData.length, data: hospitalData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, search, specialty, type } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialty) query.specialties = { $in: [specialty] };
    if (type) query.hospitalType = type;

    const hospitals = await Hospital.find(query);

    let hospitalData = hospitals;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      hospitalData = hospitals.map(hospital => ({
        ...hospital.toObject(),
        distance: calculateDistance(userLat, userLng, hospital.location.lat, hospital.location.lng)
      })).sort((a, b) => a.distance - b.distance);
    }

    res.json({ success: true, count: hospitalData.length, data: hospitalData });
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
      { name: 'AIIMS Bhopal', address: 'Saket Nagar, Bhopal, MP 462024', contact: { phone: '+91-755-2672315', email: 'info@aiimsbhopal.edu.in' }, specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'], hospitalType: 'Government', location: { lat: 23.2599, lng: 77.4126 } },
      { name: 'Hamidia Hospital', address: 'Royal Market, Bhopal, MP 462001', contact: { phone: '+91-755-2740877', email: 'info@hamidia.gov.in' }, specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency'], hospitalType: 'Government', location: { lat: 23.2327, lng: 77.4278 } },
      { name: 'Bansal Hospital', address: 'C Sector, Shahpura, Bhopal, MP 462016', contact: { phone: '+91-755-4000000', email: 'info@bansalhospital.com' }, specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'IVF'], hospitalType: 'Private', location: { lat: 23.1847, lng: 77.4346 } },
      { name: 'Chirayu Medical College', address: 'Bhopal Bypass Road, Bairagarh, MP 462030', contact: { phone: '+91-755-6699300', email: 'info@chirayu.edu.in' }, specialties: ['General Medicine', 'Cardiology', 'Gynecology', 'Pediatrics'], hospitalType: 'Private', location: { lat: 23.3342, lng: 77.3944 } },
      { name: 'Bombay Hospital Indore', address: '201 RNT Marg, Indore, MP 452001', contact: { phone: '+91-731-4077000', email: 'info@bomabyhospital.com' }, specialties: ['Cardiology', 'Neurology', 'Cancer', 'Transplant'], hospitalType: 'Private', location: { lat: 22.7196, lng: 75.8577 } },
      { name: 'MY Hospital Indore', address: 'Near Rajwada, Indore, MP 452001', contact: { phone: '+91-731-2527412', email: 'info@myhospital.gov.in' }, specialties: ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics'], hospitalType: 'Government', location: { lat: 22.7170, lng: 75.8333 } },
      { name: 'Apollo Hospitals Indore', address: 'Scheme 94, Vijay Nagar, Indore, MP 452001', contact: { phone: '+91-731-3030000', email: 'info@apollohospitals.com' }, specialties: ['Cardiology', 'Oncology', 'Nephrology', 'Transplant'], hospitalType: 'Private', location: { lat: 22.7533, lng: 75.8937 } },
      { name: 'Medanta Super Speciality', address: 'AB Road, Bypass Road, Indore, MP 452016', contact: { phone: '+91-731-3014444', email: 'info@medanta.com' }, specialties: ['Cardiac Surgery', 'Neurosurgery', 'Gastroenterology', 'Emergency'], hospitalType: 'Private', location: { lat: 22.7455, lng: 75.8933 } }
    ];
    await Hospital.insertMany(hospitals);
    res.json({ success: true, message: `${hospitals.length} hospitals seeded` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
