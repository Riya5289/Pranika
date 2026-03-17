const ResourceRequest = require('../models/ResourceRequest');
const Resource = require('../models/Resource');
const Hospital = require('../models/Hospital');

// Search hospitals with available resources
exports.searchHospitalsWithResources = async (req, res) => {
  try {
    const { resourceType, quantity, lat, lng, excludeHospitalId } = req.query;

    if (!resourceType || !quantity) {
      return res.status(400).json({ success: false, message: 'resourceType and quantity are required' });
    }

    // Find all hospitals with available resources of the specified type
    const resources = await Resource.find().populate('hospitalId');

    let availableHospitals = resources.filter(resource => {
      // Skip if hospital doesn't exist
      if (!resource.hospitalId) return false;
      
      const isExcluded = excludeHospitalId && resource.hospitalId._id.toString() === excludeHospitalId;
      if (isExcluded) return false;

      if (resourceType === 'icuBeds') {
        return resource.icuBeds.available >= parseInt(quantity);
      }
      if (resourceType === 'generalBeds') {
        return resource.generalBeds.available >= parseInt(quantity);
      }
      if (resourceType === 'ventilators') {
        return resource.ventilators.available >= parseInt(quantity);
      }
      if (resourceType === 'oxygen') {
        return resource.oxygen === 'Available';
      }
      return false;
    });

    // Calculate distance if lat/lng provided
    if (lat && lng) {
      const { calculateDistance } = require('../utils/distance');
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      availableHospitals = availableHospitals.map(r => ({
        ...r.toObject(),
        distance: calculateDistance(userLat, userLng, r.hospitalId?.location?.lat || 0, r.hospitalId?.location?.lng || 0)
      })).sort((a, b) => a.distance - b.distance);
    }

    res.json({
      success: true,
      count: availableHospitals.length,
      data: availableHospitals
    });
  } catch (error) {
    console.error('Search hospitals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a resource request
exports.createResourceRequest = async (req, res) => {
  try {
    const { requestedFromHospitalId, resourceType, quantity, urgency, reason, expectedDeliveryDate } = req.body;

    // Validate
    if (!requestedFromHospitalId || !resourceType || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get requesting hospital (from middleware)
    const requesterRecord = req.hospitalUser;
    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can request resources' });
    }

    const requestingHospitalId = requesterRecord.registeredHospitalId;

    // Prevent a hospital from requesting from itself
    if (requestingHospitalId.toString() === requestedFromHospitalId) {
      return res.status(400).json({ success: false, message: 'Cannot request resources from the same hospital' });
    }

    // Check if hospitals exist
    const fromHospital = await Hospital.findById(requestedFromHospitalId);
    if (!fromHospital) {
      return res.status(404).json({ success: false, message: 'Target hospital not found' });
    }

    // Check if the target hospital has available resources
    const targetResource = await Resource.findOne({ hospitalId: requestedFromHospitalId });
    if (!targetResource) {
      return res.status(404).json({ success: false, message: 'No resource record found for target hospital' });
    }

    const availableQty = targetResource[resourceType]?.available || 0;
    if (availableQty < quantity) {
      return res.status(400).json({
        success: false,
        message: `Target hospital only has ${availableQty} available ${resourceType}`
      });
    }

    // Create the request
    const resourceRequest = await ResourceRequest.create({
      requestingHospitalId,
      requestedFromHospitalId,
      resourceType,
      quantity,
      urgency: urgency || 'Medium',
      reason,
      expectedDeliveryDate,
      requestedByHospital: req.hospitalUser._id
    });

    await resourceRequest.populate(['requestingHospitalId', 'requestedFromHospitalId']);

    res.status(201).json({
      success: true,
      message: 'Resource request created successfully',
      data: resourceRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending resource requests for a hospital (as requestee)
exports.getPendingRequests = async (req, res) => {
  try {
    const requesterRecord = req.hospitalUser;
    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can view requests' });
    }

    const hospitalId = requesterRecord.registeredHospitalId;

    const requests = await ResourceRequest.find({
      requestedFromHospitalId: hospitalId,
      status: 'Pending'
    })
      .populate('requestingHospitalId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all requests made by a hospital
exports.getMyRequests = async (req, res) => {
  try {
    const requesterRecord = req.hospitalUser;
    if (!requesterRecord || !requesterRecord.registeredHospitalId) {
      return res.status(403).json({ success: false, message: 'Only hospitals can view requests' });
    }

    const hospitalId = requesterRecord.registeredHospitalId;

    const requests = await ResourceRequest.find({
      requestingHospitalId: hospitalId
    })
      .populate('requestedFromHospitalId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve a resource request
exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvedQuantity } = req.body;

    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only approve pending requests' });
    }

    const requesterRecord = req.hospitalUser;
    if (!requesterRecord || requesterRecord.registeredHospitalId.toString() !== request.requestedFromHospitalId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only approve requests to your hospital' });
    }

    const qty = approvedQuantity || request.quantity;

    // Update the resource availability
    const resource = await Resource.findOne({ hospitalId: request.requestedFromHospitalId });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Hospital resource record not found' });
    }

    // Decrease available quantity
    if (request.resourceType === 'icuBeds') {
      resource.icuBeds.available -= qty;
    } else if (request.resourceType === 'generalBeds') {
      resource.generalBeds.available -= qty;
    } else if (request.resourceType === 'ventilators') {
      resource.ventilators.available -= qty;
    }
    await resource.save();

    // Update request status
    request.status = 'Approved';
    request.approvedQuantity = qty;
    request.approvedByHospital = req.hospitalUser._id;
    await request.save();

    await request.populate(['requestingHospitalId', 'requestedFromHospitalId']);

    res.json({
      success: true,
      message: `Approved ${qty} ${request.resourceType}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject a resource request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only reject pending requests' });
    }

    const requesterRecord = req.hospitalUser;
    if (!requesterRecord || requesterRecord.registeredHospitalId.toString() !== request.requestedFromHospitalId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only reject requests to your hospital' });
    }

    request.status = 'Rejected';
    request.rejectionReason = rejectionReason;
    await request.save();

    await request.populate(['requestingHospitalId', 'requestedFromHospitalId']);

    res.json({
      success: true,
      message: 'Request rejected',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark request as completed
exports.completeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Can only complete approved requests' });
    }

    request.status = 'Completed';
    request.completedDate = new Date();
    await request.save();

    await request.populate(['requestingHospitalId', 'requestedFromHospitalId']);

    res.json({
      success: true,
      message: 'Request marked as completed',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
