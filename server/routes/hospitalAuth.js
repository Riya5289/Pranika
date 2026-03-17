const express = require('express');
const router = express.Router();
const { hospitalSignup, hospitalLogin } = require('../controllers/hospitalAuthController');

router.post('/signup', hospitalSignup);
router.post('/login', hospitalLogin);

module.exports = router;