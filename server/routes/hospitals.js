const express = require('express');
const router = express.Router();
const { getHospitals, getHospitalById, seedHospitals, getNearbyHospitals } = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getHospitals);
router.get('/nearby', getNearbyHospitals);
router.get('/seed', seedHospitals);
router.get('/:id', getHospitalById);

module.exports = router;
