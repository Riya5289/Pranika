// Simple in-memory captcha store (use Redis in production)
const captchaStore = new Map();

const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let answer;
  if (op === '+') answer = a + b;
  else if (op === '-') answer = a - b;
  else answer = a * b;

  const id = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const question = `${a} ${op} ${b}`;

  // Store for 5 minutes
  captchaStore.set(id, { answer, expires: Date.now() + 5 * 60 * 1000 });

  // Cleanup old entries
  for (const [key, val] of captchaStore.entries()) {
    if (val.expires < Date.now()) captchaStore.delete(key);
  }

  return { id, question };
};

const validateCaptcha = (id, userAnswer) => {
  const entry = captchaStore.get(id);
  if (!entry) return { valid: false, reason: 'Captcha expired or not found' };
  if (entry.expires < Date.now()) {
    captchaStore.delete(id);
    return { valid: false, reason: 'Captcha expired' };
  }
  if (parseInt(userAnswer) !== entry.answer) {
    return { valid: false, reason: 'Incorrect captcha answer' };
  }
  captchaStore.delete(id); // One-time use
  return { valid: true };
};

module.exports = { generateCaptcha, validateCaptcha };
