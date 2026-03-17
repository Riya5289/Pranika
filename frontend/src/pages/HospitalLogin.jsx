import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalLogin } from '../services/api';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import CaptchaField from '../components/CaptchaField';

export default function HospitalLogin() {
  const navigate = useNavigate();
  const { loginHospital } = useHospitalAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaAnswer) return setError('Please answer the security check.');
    setLoading(true);
    try {
      const res = await hospitalLogin({ ...form, captchaId, captchaAnswer });
      loginHospital(res.data.token, res.data.hospital);
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 font-monda text-sm text-gray-600 hover:text-[#EB5E28] transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Home
      </button>
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          {/* Pink hospital cross icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#FEF0EC' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 4v24M4 16h24" stroke="#EB5E28" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="mb-8 text-center">
            <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '48px', color: '#EB5E28', letterSpacing: '2px' }}>
              Hospital Sign In
            </h1>
            <p className="font-monda text-gray-500 text-sm mt-1">Access your hospital management portal</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-monda text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Hospital Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="admin@hospital.com" className="input-field" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••" className="input-field" required />
            </div>
            <CaptchaField value={captchaAnswer} onChange={setCaptchaAnswer} onIdChange={setCaptchaId} />
            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-full py-3 font-monda font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #EB5E28 0%, #EFA7A7 100%)' }}>
              {loading ? 'Signing in…' : 'Sign In to Hospital Portal'}
            </button>
            <div className="text-center space-y-2">
              <div><Link to="/hospital/signup" className="font-monda text-sm text-[#EB5E28] hover:underline">Register your hospital →</Link></div>
              <div><Link to="/login" className="font-monda text-xs text-gray-400 hover:underline">Patient/Staff login</Link></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}