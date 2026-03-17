const express = require('express');
const router = express.Router();
const {
  searchHospitalsWithResources,
  createResourceRequest,
  getPendingRequests,
  getMyRequests,
  approveRequest,
  rejectRequest,
  completeRequest
} = require('../controllers/resourceRequestController');
const { protectHospital } = require('../middleware/hospitalAuth');

// Search for hospitals with available resources
router.get('/search', protectHospital, searchHospitalsWithResources);

// Create a new resource request
router.post('/', protectHospital, createResourceRequest);

// Get pending requests for my hospital
router.get('/pending', protectHospital, getPendingRequests);

// Get all my requests (as requesting hospital)
router.get('/my-requests', protectHospital, getMyRequests);

// Approve a resource request
router.post('/:requestId/approve', protectHospital, approveRequest);

// Reject a resource request
router.post('/:requestId/reject', protectHospital, rejectRequest);

// Mark request as completed
router.post('/:requestId/complete', protectHospital, completeRequest);

module.exports = router;
