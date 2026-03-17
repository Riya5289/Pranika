import { useState, useEffect } from 'react';
import { getResources, seedResources } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'icu', label: 'ICU Beds' },
  { key: 'general', label: 'General Beds' },
  { key: 'ventilator', label: 'Ventilators' },
  { key: 'oxygen', label: 'Oxygen' },
];

function BedBar({ available, total }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-monda text-xs text-gray-500 whitespace-nowrap">{available}/{total}</span>
    </div>
  );
}

export default function Availability() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await getResources({ filter });
      setResources(res.data.data);
    } catch {
      setResources([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, [filter]);

  const handleSeed = async () => {
    setSeeding(true);
    try { await seedResources(); await fetchResources(); } catch {}
    setSeeding(false);
  };

  const getOverallStatus = (r) => {
    const icuOk = r.icuBeds?.available > 0;
    const genOk = r.generalBeds?.available > 0;
    if (icuOk && genOk) return 'available';
    if (!icuOk && !genOk) return 'full';
    return 'limited';
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 page-enter">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-monda text-xs font-bold text-green-600 uppercase tracking-wider">Live</span>
          </div>
          <h1
            className="text-[48px] leading-none tracking-wide"
            style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
          >
            Hospital Availability
          </h1>
          <p className="font-monda text-gray-500 mt-1">
            Real-time bed and equipment status across all hospitals
          </p>
        </div>
        <button onClick={fetchResources} className="btn-outline self-start sm:self-auto flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 font-monda text-sm font-bold border-2 transition-all ${
              filter === f.key
                ? 'bg-[#EB5E28] border-[#EB5E28] text-white'
                : 'border-gray-200 text-gray-600 hover:border-[#EFA7A7] hover:text-[#EFA7A7]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="flex-1 h-4 bg-gray-100 rounded" />
              <div className="w-20 h-4 bg-gray-100 rounded" />
              <div className="w-20 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#EFA7A7' }}>
                  {['Hospital', 'Distance', 'ICU Beds', 'General Beds', 'Ventilators', 'Oxygen', 'Status', 'Action'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left font-monda text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resources.map((r, i) => (
                  <tr key={r._id} className={`hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <p className="font-roboto font-bold text-[14px] text-gray-800">
                        {r.hospitalId?.name || 'Unknown'}
                      </p>
                      <p className="font-monda text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                        {r.hospitalId?.address}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-monda text-sm text-gray-600 whitespace-nowrap">
                      {r.hospitalId?.distance} km
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <BedBar available={r.icuBeds?.available} total={r.icuBeds?.total} />
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <BedBar available={r.generalBeds?.available} total={r.generalBeds?.total} />
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <BedBar available={r.ventilators?.available} total={r.ventilators?.total} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.oxygen === 'Available' ? 'available' : r.oxygen === 'Limited' ? 'limited' : 'full'} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={getOverallStatus(r)} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/hospitals/${r.hospitalId?._id}`)}
                        className="font-monda text-xs font-bold text-[#EB5E28] hover:underline whitespace-nowrap"
                      >
                        View Hospital →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFA7A7]/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EFA7A7" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <h3 className="font-roboto font-bold text-lg text-gray-700">No resource data found</h3>
          <p className="font-monda text-gray-400 text-sm mt-1">Load hospitals first, then seed resource data</p>
          <button onClick={handleSeed} disabled={seeding} className="mt-4 btn-outline">
            {seeding ? 'Seeding…' : 'Load Sample Data'}
          </button>
        </div>
      )}
    </div>
  );
}
