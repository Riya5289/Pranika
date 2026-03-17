import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import CaptchaField from '../components/CaptchaField';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!captchaAnswer) return setError('Please answer the security check.');
    setLoading(true);
    try {
      await signup({ ...form, captchaId, captchaAnswer });
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1
              className="text-[48px] leading-tight tracking-widest"
              style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
            >
              Create Account
            </h1>
            <p className="font-monda text-gray-500 text-sm mt-1">
              Join the Pranika healthcare network
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-monda text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-monda text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Dr. Priya Sharma"
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@hospital.com"
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="input-field"
                required
                minLength={6}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input-field"
                required
              />
            </div>

            <CaptchaField
              value={captchaAnswer}
              onChange={setCaptchaAnswer}
              onIdChange={setCaptchaId}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full py-3 font-monda font-bold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #EB5E28 0%, #EFA7A7 100%)' }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <div className="text-center">
              <Link to="/login" className="font-monda text-sm text-[#EB5E28] hover:underline">
                Already have an account? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
