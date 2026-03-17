const express = require('express');
const router = express.Router();
const { getResources, seedResources } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getResources);
router.get('/seed', seedResources);

module.exports = router;
