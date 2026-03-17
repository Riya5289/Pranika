const express = require('express');
const router = express.Router();
const { generateCaptcha } = require('../utils/captcha');

router.get('/generate', (req, res) => {
  const captcha = generateCaptcha();
  res.json({ success: true, data: captcha });
});

module.exports = router;
