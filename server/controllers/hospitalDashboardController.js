const Resource = require('../models/Resource');
const ResourceLog = require('../models/ResourceLog');
const Specialist = require('../models/Specialist');
const HospitalUser = require('../models/HospitalUser');

// GET dashboard data for logged-in hospital
exports.getDashboard = async (req, res) => {
  try {
    const hospitalId = req.hospitalUser.registeredHospitalId;
    const resource = await Resource.findOne({ hospitalId });
    const specialists = await Specialist.find({ hospitalId });
    const logs = await ResourceLog.find({ hospitalId }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: { resource, specialists, logs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE beds/ventilators/oxygen counts
exports.updateResources = async (req, res) => {
  try {
    const hospitalId = req.hospitalUser.registeredHospitalId;
    const { icuBeds, generalBeds, ventilators, oxygen } = req.body;

    const resource = await Resource.findOne({ hospitalId });
    if (!resource)
      return res.status(404).json({ success: false, message: 'Resource record not found' });

    // Log changes
    const changes = [
      { type: 'ICU Bed',      prev: resource.icuBeds,      next: icuBeds },
      { type: 'General Bed',  prev: resource.generalBeds,  next: generalBeds },
      { type: 'Ventilator',   prev: resource.ventilators,  next: ventilators },
      { type: 'Oxygen',       prev: resource.oxygen,       next: oxygen },
    ];
    for (const c of changes) {
      if (c.next !== undefined) {
        await ResourceLog.create({
          hospitalId, updatedBy: req.hospitalUser._id,
          resourceType: c.type, action: 'updated',
          previousValue: c.prev, newValue: c.next
        });
      }
    }

    if (icuBeds)     { resource.icuBeds = icuBeds; }
    if (generalBeds) { resource.generalBeds = generalBeds; }
    if (ventilators) { resource.ventilators = ventilators; }
    if (oxygen)      { resource.oxygen = oxygen; }
    resource.lastUpdated = new Date();
    resource.updatedByHospital = req.hospitalUser._id;
    await resource.save();

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOG equipment taken by someone
exports.logEquipmentTaken = async (req, res) => {
  try {
    const hospitalId = req.hospitalUser.registeredHospitalId;
    const { resourceType, takenBy, notes } = req.body;

    const resource = await Resource.findOne({ hospitalId });
    let previousValue, newValue;

    if (resourceType === 'ICU Bed') {
      previousValue = resource.icuBeds.available;
      newValue = Math.max(0, resource.icuBeds.available - 1);
      resource.icuBeds.available = newValue;
    } else if (resourceType === 'General Bed') {
      previousValue = resource.generalBeds.available;
      newValue = Math.max(0, resource.generalBeds.available - 1);
      resource.generalBeds.available = newValue;
    } else if (resourceType === 'Ventilator') {
      previousValue = resource.ventilators.available;
      newValue = Math.max(0, resource.ventilators.available - 1);
      resource.ventilators.available = newValue;
    }

    resource.lastUpdated = new Date();
    await resource.save();

    await ResourceLog.create({
      hospitalId, updatedBy: req.hospitalUser._id,
      resourceType, action: 'taken',
      previousValue, newValue, takenBy, notes
    });

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOG equipment returned
exports.logEquipmentReturned = async (req, res) => {
  try {
    const hospitalId = req.hospitalUser.registeredHospitalId;
    const { resourceType, notes } = req.body;

    const resource = await Resource.findOne({ hospitalId });
    let previousValue, newValue;

    if (resourceType === 'ICU Bed') {
      previousValue = resource.icuBeds.available;
      newValue = Math.min(resource.icuBeds.total, resource.icuBeds.available + 1);
      resource.icuBeds.available = newValue;
    } else if (resourceType === 'General Bed') {
      previousValue = resource.generalBeds.available;
      newValue = Math.min(resource.generalBeds.total, resource.generalBeds.available + 1);
      resource.generalBeds.available = newValue;
    } else if (resourceType === 'Ventilator') {
      previousValue = resource.ventilators.available;
      newValue = Math.min(resource.ventilators.total, resource.ventilators.available + 1);
      resource.ventilators.available = newValue;
    }

    resource.lastUpdated = new Date();
    await resource.save();

    await ResourceLog.create({
      hospitalId, updatedBy: req.hospitalUser._id,
      resourceType, action: 'returned',
      previousValue, newValue, notes
    });

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD or UPDATE specialist
exports.upsertSpecialist = async (req, res) => {
  try {
    const hospitalId = req.hospitalUser.registeredHospitalId;
    const { specialistId, name, specialty, availableDays, availableFrom, availableTo, isAvailableToday, contact } = req.body;

    let specialist;
    if (specialistId) {
      specialist = await Specialist.findByIdAndUpdate(
        specialistId,
        { name, specialty, availableDays, availableFrom, availableTo, isAvailableToday, contact },
        { new: true }
      );
    } else {
      specialist = await Specialist.create({
        hospitalId, name, specialty, availableDays, availableFrom, availableTo, isAvailableToday, contact
      });
    }

    await ResourceLog.create({
      hospitalId, updatedBy: req.hospitalUser._id,
      resourceType: 'Specialist', action: 'updated',
      newValue: { name, specialty, isAvailableToday }
    });

    res.json({ success: true, data: specialist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE specialist
exports.deleteSpecialist = async (req, res) => {
  try {
    await Specialist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Specialist removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET resource logs
exports.getLogs = async (req, res) => {
  try {
    const hospitalId = req.hospitalUser.registeredHospitalId;
    const logs = await ResourceLog.find({ hospitalId })
      .populate('updatedBy', 'hospitalName email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};