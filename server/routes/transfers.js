const express = require('express');
const router = express.Router();
const { createTransfer, getTransfers, getSuggestedHospitals } = require('../controllers/transferController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createTransfer);
router.get('/', getTransfers);
router.get('/suggestions', getSuggestedHospitals);

module.exports = router;
