const express = require('express');
const router = express.Router();
const { protectHospital } = require('../middleware/hospitalAuth');
const {
  getDashboard, updateResources, logEquipmentTaken,
  logEquipmentReturned, upsertSpecialist, deleteSpecialist, getLogs
} = require('../controllers/hospitalDashboardController');

router.use(protectHospital);
router.get('/dashboard', getDashboard);
router.put('/resources', updateResources);
router.post('/equipment/taken', logEquipmentTaken);
router.post('/equipment/returned', logEquipmentReturned);
router.post('/specialists', upsertSpecialist);
router.delete('/specialists/:id', deleteSpecialist);
router.get('/logs', getLogs);

module.exports = router;