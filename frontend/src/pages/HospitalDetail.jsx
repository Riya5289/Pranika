import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHospitalById } from '../services/api';

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHospitalById(id)
      .then(res => setHospital(res.data.data))
      .catch(() => navigate('/hospitals'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-[#EFA7A7] border-t-[#EB5E28] rounded-full animate-spin" />
    </div>
  );

  if (!hospital) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 page-enter">
      <button
        onClick={() => navigate('/hospitals')}
        className="flex items-center gap-2 font-monda text-sm text-gray-500 hover:text-[#EB5E28] mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Hospitals
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="text-[36px] leading-tight"
                style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
              >
                {hospital.name}
              </h1>
              <span className="inline-block mt-1 text-xs font-monda font-bold px-2.5 py-0.5 rounded-full bg-[#EFA7A7]/20 text-[#EFA7A7]">
                {hospital.hospitalType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 font-monda text-sm text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {hospital.distance} km away
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <p className="font-monda text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
              <p className="font-monda text-gray-700">{hospital.address}</p>
            </div>
            <div>
              <p className="font-monda text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
              <a href={`tel:${hospital.contact.phone}`} className="font-monda text-[#EB5E28] hover:underline">
                {hospital.contact.phone}
              </a>
            </div>
          </div>

          <div>
            <p className="font-monda text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties?.map((s) => (
                <span
                  key={s}
                  className="font-monda text-sm px-3 py-1 rounded-full border-2 border-[#EFA7A7]/40 text-gray-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="flex flex-col gap-4">
          <div className="card p-6">
            <h3 className="font-roboto font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/availability')}
                className="w-full rounded-full py-3 font-monda font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #EB5E28 0%, #EFA7A7 100%)' }}
              >
                Check Availability
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-roboto font-bold text-gray-800 mb-3">Hospital Info</h3>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm font-monda">
                <dt className="text-gray-500">Type</dt>
                <dd className="font-bold text-gray-700">{hospital.hospitalType}</dd>
              </div>
              <div className="flex justify-between text-sm font-monda">
                <dt className="text-gray-500">Distance</dt>
                <dd className="font-bold text-gray-700">{hospital.distance} km</dd>
              </div>
              <div className="flex justify-between text-sm font-monda">
                <dt className="text-gray-500">Specialties</dt>
                <dd className="font-bold text-gray-700">{hospital.specialties?.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
