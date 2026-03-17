import { useState, useEffect, useCallback } from 'react';
import { getHospitals, seedHospitals } from '../services/api';
import HospitalCard from '../components/HospitalCard';

const SPECIALTIES = ['Cardiology', 'Neurology', 'Oncology', 'Emergency', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Surgery'];
const TYPES = ['Government', 'Private', 'Trust', 'Clinic'];

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ specialty: '', type: '', maxDistance: '' });

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getHospitals(params);
      setHospitals(res.data.data);
    } catch {
      setHospitals([]);
    }
    setLoading(false);
  }, [search, filters]);

  useEffect(() => {
    const t = setTimeout(fetchHospitals, 300);
    return () => clearTimeout(t);
  }, [fetchHospitals]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedHospitals();
      await fetchHospitals();
    } catch {}
    setSeeding(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 page-enter">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-[48px] leading-none tracking-wide"
          style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
        >
          Hospital Registry
        </h1>
        <p className="font-monda text-gray-500 mt-1">
          Find and connect with hospitals across your region
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search hospitals by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={filters.specialty}
          onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="">All Specialties</option>
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="input-field w-auto min-w-[140px]"
        >
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filters.maxDistance}
          onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
          className="input-field w-auto min-w-[140px]"
        >
          <option value="">Any Distance</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="20">Within 20 km</option>
        </select>
      </div>

      {/* Results bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-monda text-sm text-gray-500">
          {loading ? 'Searching…' : `${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} found`}
        </p>
        {hospitals.length === 0 && !loading && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="font-monda text-sm text-[#EB5E28] hover:underline disabled:opacity-50"
          >
            {seeding ? 'Seeding…' : '+ Load sample hospitals'}
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded mb-3 w-3/4" />
              <div className="h-3 bg-gray-100 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : hospitals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hospitals.map((h) => (
            <HospitalCard key={h._id} hospital={h} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFA7A7]/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EFA7A7" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h3 className="font-roboto font-bold text-lg text-gray-700">No hospitals found</h3>
          <p className="font-monda text-gray-400 text-sm mt-1">Try adjusting your filters or load sample data</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="mt-4 btn-outline"
          >
            {seeding ? 'Loading…' : 'Load Sample Hospitals'}
          </button>
        </div>
      )}
    </div>
  );
}
