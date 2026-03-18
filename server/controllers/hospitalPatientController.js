const HospitalPatient = require('../models/HospitalPatient');
const HospitalPatientTransfer = require('../models/HospitalPatientTransfer');
const Hospital = require('../models/Hospital');

// Add new patient to hospital
exports.addPatient = async (req, res) => {
  try {
    const { patientName, age, gender, contact, condition, medicalHistory, department, allergies, bloodGroup, notes } = req.body;

    if (!patientName || !age || !gender || !contact || !condition) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const requesterRecord = req.hospitalUser;
    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can add patients' });
    }

    const patient = await HospitalPatient.create({
      hospitalId: requesterRecord.registeredHospitalId,
      patientName,
      age,
      gender,
      contact,
      condition,
      medicalHistory,
      department,
      allergies,
      bloodGroup,
      notes,
      addedByHospital: req.hospitalUser._id
    });

    await patient.populate('hospitalId', 'name address');

    res.status(201).json({
      success: true,
      message: 'Patient added successfully',
      data: patient
    });
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all patients in a hospital
exports.getHospitalPatients = async (req, res) => {
  try {
    const { status } = req.query;
    const requesterRecord = req.hospitalUser;

    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can view patients' });
    }

    let query = { hospitalId: requesterRecord.registeredHospitalId };
    if (status) {
      // Normalize status for flexible matching: accept 'admitted', 'Admitted',
      // 'ready-for-transfer' or 'Ready for Transfer' by comparing case-insensitively
      // and allowing hyphens or spaces.
      const normalized = status.toString().replace(/-/g, ' ').trim();
      // Use a case-insensitive exact regex match
      query.status = { $regex: `^${normalized}$`, $options: 'i' };
    }

    const patients = await HospitalPatient.find(query)
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single patient
exports.getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await HospitalPatient.findById(patientId).populate('hospitalId', 'name address');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient details
exports.updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { patientName, age, gender, contact, condition, medicalHistory, department, allergies, bloodGroup, status, notes } = req.body;

    const patient = await HospitalPatient.findByIdAndUpdate(
      patientId,
      {
        patientName,
        age,
        gender,
        contact,
        condition,
        medicalHistory,
        department,
        allergies,
        bloodGroup,
        status,
        notes
      },
      { new: true }
    ).populate('hospitalId', 'name address');

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create patient transfer request
exports.initiatePatientTransfer = async (req, res) => {
  try {
    const { patientId, toHospitalId, transferReason, urgency, medicalSummary, requiredSpecialty } = req.body;

    if (!patientId || !toHospitalId || !transferReason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const patient = await HospitalPatient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const requesterRecord = req.hospitalUser;
    if (patient.hospitalId.toString() !== requesterRecord.registeredHospitalId.toString()) {
      return res.status(403).json({ success: false, message: 'Can only transfer your own patients' });
    }

    const toHospital = await Hospital.findById(toHospitalId);
    if (!toHospital) {
      return res.status(404).json({ success: false, message: 'Target hospital not found' });
    }

    const transfer = await HospitalPatientTransfer.create({
      patientId,
      fromHospitalId: patient.hospitalId,
      toHospitalId,
      transferReason,
      urgency: urgency || 'Medium',
      medicalSummary,
      requiredSpecialty,
      transferredByHospital: req.hospitalUser._id
    });

    await transfer.populate([
      { path: 'patientId' },
      { path: 'fromHospitalId', select: 'name address' },
      { path: 'toHospitalId', select: 'name address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Patient transfer request created',
      data: transfer
    });
  } catch (error) {
    console.error('Initiate transfer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending transfer requests for hospital (as receiver)
exports.getPendingTransfers = async (req, res) => {
  try {
    const requesterRecord = req.hospitalUser;

    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can view transfers' });
    }

    const transfers = await HospitalPatientTransfer.find({
      toHospitalId: requesterRecord.registeredHospitalId,
      status: 'Pending'
    })
      .populate('patientId')
      .populate('fromHospitalId', 'name address contact')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    console.error('Get pending transfers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transfer requests made by hospital (as sender)
exports.getMyTransfers = async (req, res) => {
  try {
    const requesterRecord = req.hospitalUser;

    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can view transfers' });
    }

    const transfers = await HospitalPatientTransfer.find({
      fromHospitalId: requesterRecord.registeredHospitalId
    })
      .populate('patientId')
      .populate('toHospitalId', 'name address contact')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve patient transfer
exports.approveTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { estimatedArrivalTime } = req.body;

    const transfer = await HospitalPatientTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (transfer.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only approve pending transfers' });
    }

    const requesterRecord = req.hospitalUser;
    if (transfer.toHospitalId.toString() !== requesterRecord.registeredHospitalId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only approve transfers to your hospital' });
    }

    transfer.status = 'Approved';
    transfer.approvedByHospital = req.hospitalUser._id;
    if (estimatedArrivalTime) {
      transfer.estimatedArrivalTime = estimatedArrivalTime;
    }
    await transfer.save();

    await transfer.populate([
      { path: 'patientId' },
      { path: 'fromHospitalId', select: 'name address' },
      { path: 'toHospitalId', select: 'name address' }
    ]);

    res.json({
      success: true,
      message: 'Transfer approved successfully',
      data: transfer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject patient transfer
exports.rejectTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { rejectionReason } = req.body;

    const transfer = await HospitalPatientTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (transfer.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only reject pending transfers' });
    }

    const requesterRecord = req.hospitalUser;
    if (transfer.toHospitalId.toString() !== requesterRecord.registeredHospitalId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only reject transfers to your hospital' });
    }

    transfer.status = 'Rejected';
    transfer.rejectionReason = rejectionReason || '';
    await transfer.save();

    await transfer.populate([
      { path: 'patientId' },
      { path: 'fromHospitalId', select: 'name address' },
      { path: 'toHospitalId', select: 'name address' }
    ]);

    res.json({
      success: true,
      message: 'Transfer rejected',
      data: transfer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark transfer as in transit
exports.markInTransit = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { ambulanceDetails } = req.body;

    const transfer = await HospitalPatientTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (transfer.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Can only mark approved transfers as in transit' });
    }

    transfer.status = 'In Transit';
    transfer.ambulanceDetails = ambulanceDetails;
    await transfer.save();

    await transfer.populate([
      { path: 'patientId' },
      { path: 'fromHospitalId', select: 'name address' },
      { path: 'toHospitalId', select: 'name address' }
    ]);

    res.json({
      success: true,
      message: 'Transfer marked as in transit',
      data: transfer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark transfer as completed
exports.completeTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await HospitalPatientTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (transfer.status !== 'In Transit') {
      return res.status(400).json({ success: false, message: 'Can only complete transfers in transit' });
    }

    transfer.status = 'Completed';
    transfer.actualArrivalTime = new Date();

    // Update patient's hospital
    await HospitalPatient.findByIdAndUpdate(transfer.patientId, {
      hospitalId: transfer.toHospitalId,
      status: 'Admitted'
    });

    await transfer.save();

    await transfer.populate([
      { path: 'patientId' },
      { path: 'fromHospitalId', select: 'name address' },
      { path: 'toHospitalId', select: 'name address' }
    ]);

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: transfer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search hospitals by specialties
exports.searchHospitalsBySpecialty = async (req, res) => {
  try {
    const { specialty, lat, lng } = req.query;

    if (!specialty) {
      return res.status(400).json({ success: false, message: 'Specialty is required' });
    }

    let hospitals = await Hospital.find({
      specialties: { $in: [specialty] }
    });

    if (lat && lng) {
      const { calculateDistance } = require('../utils/distance');
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      hospitals = hospitals.map(h => ({
        ...h.toObject(),
        distance: calculateDistance(userLat, userLng, h.location.lat, h.location.lng)
      })).sort((a, b) => a.distance - b.distance);
    }

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    console.error('Search hospitals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
