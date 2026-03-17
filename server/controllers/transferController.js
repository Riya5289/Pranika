const TransferRequest = require('../models/TransferRequest');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const { sendTransferRequestEmail } = require('../services/email.services');
const path = require('path');
const fs = require('fs');

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
          path: file.path,
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
      await sendTransferRequestEmail(
        toHospital.contact.email,
        emailData,
        attachments
      );
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
      data: transfer
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
