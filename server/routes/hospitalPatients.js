const express = require('express');
const router = express.Router();
const {
  addPatient,
  getHospitalPatients,
  getPatientById,
  updatePatient,
  initiatePatientTransfer,
  getPendingTransfers,
  getMyTransfers,
  approveTransfer,
  rejectTransfer,
  markInTransit,
  completeTransfer,
  searchHospitalsBySpecialty
} = require('../controllers/hospitalPatientController');
const { protectHospital } = require('../middleware/hospitalAuth');

// Patient management
router.post('/patients/add', protectHospital, addPatient);
router.get('/patients', protectHospital, getHospitalPatients);
router.get('/patients/:patientId', protectHospital, getPatientById);
router.put('/patients/:patientId', protectHospital, updatePatient);

// Patient transfers
router.post('/transfers/initiate', protectHospital, initiatePatientTransfer);
router.get('/transfers/pending', protectHospital, getPendingTransfers);
router.get('/transfers/my-transfers', protectHospital, getMyTransfers);
router.post('/transfers/:transferId/approve', protectHospital, approveTransfer);
router.post('/transfers/:transferId/reject', protectHospital, rejectTransfer);
router.post('/transfers/:transferId/in-transit', protectHospital, markInTransit);
router.post('/transfers/:transferId/complete', protectHospital, completeTransfer);

// Search hospitals
router.get('/search-by-specialty', protectHospital, searchHospitalsBySpecialty);

module.exports = router;
