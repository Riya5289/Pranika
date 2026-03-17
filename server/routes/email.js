const express = require('express');
const { sendRegistrationEmail } = require('../services/email.services');

const router = express.Router();

// Test email sending
router.post('/test-send', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    await sendRegistrationEmail(email, name);

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;