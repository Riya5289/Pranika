import { useNavigate } from 'react-router-dom';

export default function HospitalCard({ hospital, onCheckAvailability, onRequestTransfer }) {
  const navigate = useNavigate();

  return (
    <div className="card p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            className="text-[18px] leading-tight"
            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}
          >
            {hospital.name}
          </h3>
          <span className="inline-block mt-1 text-xs font-monda font-bold px-2 py-0.5 rounded-full bg-[#EFA7A7]/20 text-[#EB5E28]">
            {hospital.hospitalType}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm font-monda text-gray-500 whitespace-nowrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {hospital.distance ? `${hospital.distance.toFixed(1)} km` : 'Distance unavailable'}
        </div>
      </div>

      {/* Address */}
      <p className="font-monda text-sm text-gray-500 leading-snug">{hospital.address}</p>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {hospital.specialties?.slice(0, 4).map((s) => (
          <span
            key={s}
            className="text-xs font-monda px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/hospitals/${hospital._id}`)}
          className="flex-1 text-sm font-monda font-bold rounded-full border-2 border-[#EFA7A7] text-[#EFA7A7] py-2 hover:bg-[#EFA7A7] hover:text-white transition-all"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
