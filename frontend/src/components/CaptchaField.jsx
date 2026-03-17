import { useEffect, useState } from 'react';
import { getCaptcha } from '../services/api';

export default function CaptchaField({ value, onChange, onIdChange }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const res = await getCaptcha();
      setQuestion(res.data.data.question);
      onIdChange(res.data.data.id);
    } catch {
      setQuestion('Error loading captcha');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCaptcha(); }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-monda text-sm font-bold text-gray-700">Security Check</label>
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-[140px]">
          {loading ? (
            <span className="font-monda text-gray-400 text-sm">Loading…</span>
          ) : (
            <span className="font-roboto font-bold text-[#EB5E28] text-base tracking-widest">
              {question} = ?
            </span>
          )}
        </div>
        <input
          type="number"
          placeholder="Answer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-24 pr-1.5"
        />
        <button
          type="button"
          onClick={fetchCaptcha}
          title="Refresh captcha"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
