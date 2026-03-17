const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Specialist = require('../models/Specialist');

router.use(protect);
router.get('/', async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const query = hospitalId ? { hospitalId } : {};
    const specialists = await Specialist.find(query).populate('hospitalId', 'name');
    res.json({ success: true, data: specialists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;