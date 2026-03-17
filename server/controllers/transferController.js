const TransferRequest = require('../models/TransferRequest');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const { sendTransferRequestEmail } = require('../services/email.services');
const fs = require('fs');

function toPublicAttachment(att) {
  if (!att) return att;
  const storageName = att.path ? att.path.split('/').pop() : null;
  const url = storageName ? `/uploads/transfers/${storageName}` : null;
  return {
    filename: att.filename,
    mimetype: att.mimetype,
    size: att.size,
    url
  };
}

function toPublicTransfer(t) {
  if (!t) return t;
  const obj = t.toObject ? t.toObject() : t;
  return {
    ...obj,
    attachments: Array.isArray(obj.attachments) ? obj.attachments.map(toPublicAttachment) : []
  };
}

exports.createTransfer = async (req, res) => {
  try {
    const { patientInfo, fromHospitalId, toHospitalId, medicalNotes } = req.body;

    // Validate required fields
    if (!patientInfo || !fromHospitalId || !toHospitalId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get hospital details for email
    const fromHospital = await Hospital.findById(fromHospitalId);
    const toHospital = await Hospital.findById(toHospitalId);

    if (!fromHospital || !toHospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Process uploaded files
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          // store relative path; we expose it via /uploads
          path: `transfers/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Create transfer request
    const transfer = await TransferRequest.create({
      patientInfo: JSON.parse(patientInfo), // Assuming sent as JSON string
      fromHospitalId,
      toHospitalId,
      medicalNotes,
      attachments,
      requestedBy: req.user._id
    });

    // Prepare email data
    const emailData = {
      patientInfo: transfer.patientInfo,
      fromHospitalName: fromHospital.name,
      toHospitalName: toHospital.name,
      medicalNotes: transfer.medicalNotes
    };

    // Send email with attachments
    try {
      if (toHospital.contact && toHospital.contact.email) {
        await sendTransferRequestEmail(
          toHospital.contact.email,
          emailData,
          attachments
        );
      } else {
        console.warn('No email address found for target hospital, skipping email notification');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Populate response
    await transfer.populate('fromHospitalId', 'name address contact');
    await transfer.populate('toHospitalId', 'name address contact');

    res.status(201).json({
      success: true,
      message: 'Transfer request created successfully',
      data: toPublicTransfer(transfer)
    });
  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await TransferRequest.find({ requestedBy: req.user._id })
      .populate('fromHospitalId', 'name address contact')
      .populate('toHospitalId', 'name address contact')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: transfers.length, data: transfers.map(toPublicTransfer) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransferById = async (req, res) => {
  try {
    const transfer = await TransferRequest.findOne({ _id: req.params.id, requestedBy: req.user._id })
      .populate('fromHospitalId', 'name address contact')
      .populate('toHospitalId', 'name address contact');

    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, data: toPublicTransfer(transfer) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSuggestedHospitals = async (req, res) => {
  try {
    const { requiredResources = [] } = req.query;
    const resources = await Resource.find().populate('hospitalId', 'name address contact specialties location');

    let filteredResources = resources.filter(r => r.hospitalId); // Only include resources with valid hospitalId

    // If requiredResources is provided and not empty, filter by them
    if (Array.isArray(requiredResources) && requiredResources.length > 0) {
      filteredResources = filteredResources.filter(r => {
        if (requiredResources.includes('ICU Bed') && r.icuBeds.available === 0) return false;
        if (requiredResources.includes('Ventilator') && r.ventilators.available === 0) return false;
        return true;
      });
    }

    // If no resources match the criteria, return some default hospitals
    if (filteredResources.length === 0) {
      // Get some hospitals directly if no resources match
      const hospitals = await Hospital.find().limit(5);
      const defaultSuggestions = hospitals.map(h => ({
        hospital: {
          _id: h._id,
          name: h.name,
          address: h.address,
          contact: h.contact,
          distance: 5 // Default distance
        },
        resources: {
          icuBeds: { available: 0, total: 0 },
          ventilators: { available: 0, total: 0 }
        },
        eta: `${Math.ceil(5 * 3)} min`
      }));
      return res.json({ success: true, data: defaultSuggestions });
    }

    const suggestions = filteredResources
      .filter(r => r.hospitalId) // Double check hospital exists
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
