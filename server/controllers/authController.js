const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateCaptcha } = require('../utils/captcha');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, captchaId, captchaAnswer } = req.body;

    // Validate captcha
    const captchaResult = validateCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.valid) {
      return res.status(400).json({ success: false, message: captchaResult.reason });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body;

    // Validate captcha
    const captchaResult = validateCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.valid) {
      return res.status(400).json({ success: false, message: captchaResult.reason });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
