const express = require('express');
const router = express.Router();
const { createTransfer, getTransfers, getTransferById, getSuggestedHospitals } = require('../controllers/transferController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

router.use(protect);
router.post('/create', uploadMultiple, createTransfer);
router.get('/', getTransfers);
router.get('/suggestions', getSuggestedHospitals);
router.get('/:id', getTransferById);

module.exports = router;
