const TransferRequest = require('../models/TransferRequest');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');

exports.createTransfer = async (req, res) => {
  try {
    const { patientCondition, currentHospital, requiredResources, targetHospital } = req.body;

    const hospital = await Hospital.findById(targetHospital);
    if (!hospital) return res.status(404).json({ success: false, message: 'Target hospital not found' });

    const eta = `${Math.ceil(hospital.distance * 3)} minutes`;

    const transfer = await TransferRequest.create({
      patientCondition,
      currentHospital,
      requiredResources,
      targetHospital,
      requestedBy: req.user._id,
      estimatedETA: eta
    });

    await transfer.populate('targetHospital', 'name address contact');
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await TransferRequest.find({ requestedBy: req.user._id })
      .populate('targetHospital', 'name address')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: transfers.length, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSuggestedHospitals = async (req, res) => {
  try {
    const { requiredResources = [] } = req.query;
    const resources = await Resource.find().populate('hospitalId', 'name address distance contact specialties');

    const suggestions = resources
      .filter(r => {
        const needs = Array.isArray(requiredResources) ? requiredResources : [requiredResources];
        if (needs.includes('ICU Bed') && r.icuBeds.available === 0) return false;
        if (needs.includes('Ventilator') && r.ventilators.available === 0) return false;
        return true;
      })
      .map(r => ({
        hospital: r.hospitalId,
        resources: r,
        eta: `${Math.ceil((r.hospitalId?.distance || 5) * 3)} min`
      }))
      .sort((a, b) => (a.hospital?.distance || 0) - (b.hospital?.distance || 0))
      .slice(0, 5);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
