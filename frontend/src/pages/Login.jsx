import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CaptchaField from '../components/CaptchaField';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaAnswer) return setError('Please answer the security check.');
    setLoading(true);
    try {
      const res = await login({ ...form, captchaId, captchaAnswer });
      loginUser(res.data.token, res.data.user);
      navigate('/hospitals');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8 sm:p-10">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1
              className="text-[48px] leading-tight tracking-widest"
              style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
            >
              Sign In
            </h1>
            <p className="font-monda text-gray-500 text-sm mt-1">
              Access the Pranika healthcare network
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-monda text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                placeholder="••••••••"
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="text-center">
              <Link
                to="/signup"
                className="font-monda text-sm text-[#EB5E28] hover:underline"
              >
                Don't have an account? Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Decorative */}
        <div className="mt-6 text-center">
          <p className="font-monda text-xs text-gray-400">
            Pranika · Secure Healthcare Coordination
          </p>
        </div>
      </div>
    </div>
  );
}
