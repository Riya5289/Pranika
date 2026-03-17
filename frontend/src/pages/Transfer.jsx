import { useState, useEffect } from 'react';
import { getSuggestedHospitals, createTransfer, getTransfers } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const CONDITIONS = ['Critical', 'Serious', 'Stable', 'Emergency'];
const RESOURCES = ['ICU Bed', 'Ventilator', 'Specialist', 'Emergency Surgery'];

function SuggestedCard({ suggestion, onSelect, selected }) {
  const { hospital, resources, eta } = suggestion;
  const isSelected = selected?._id === hospital._id;

  return (
    <div
      onClick={() => onSelect(suggestion)}
      className={`card p-5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-2 border-[#EB5E28] shadow-md'
          : 'border border-gray-100 hover:border-[#EFA7A7]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-roboto font-bold text-[15px] text-gray-800">{hospital.name}</h3>
          <p className="font-monda text-xs text-gray-400 mt-0.5">{hospital.address}</p>
        </div>
        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-[#EB5E28] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-monda">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">ICU Beds</span>
          <span className="font-bold text-gray-700">{resources.icuBeds?.available}/{resources.icuBeds?.total}</span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">Ventilators</span>
          <span className="font-bold text-gray-700">{resources.ventilators?.available}/{resources.ventilators?.total}</span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">Distance</span>
          <span className="font-bold text-gray-700">{hospital.distance} km</span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400 block">ETA</span>
          <span className="font-bold text-[#EB5E28]">{eta}</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(suggestion); }}
        className={`w-full rounded-full py-2 font-monda text-sm font-bold transition-all ${
          isSelected
            ? 'bg-[#EB5E28] text-white'
            : 'border-2 border-[#EFA7A7] text-[#EFA7A7] hover:bg-[#EFA7A7] hover:text-white'
        }`}
      >
        {isSelected ? '✓ Selected' : 'Request Transfer'}
      </button>
    </div>
  );
}

export default function Transfer() {
  const [form, setForm] = useState({
    currentHospital: '',
    patientCondition: '',
    requiredResources: [],
  });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  const [error, setError] = useState('');
  const [pastTransfers, setPastTransfers] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

  useEffect(() => {
    getTransfers()
      .then(res => setPastTransfers(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingPast(false));
  }, [transferResult]);

  const toggleResource = (r) => {
    setForm(f => ({
      ...f,
      requiredResources: f.requiredResources.includes(r)
        ? f.requiredResources.filter(x => x !== r)
        : [...f.requiredResources, r],
    }));
    setSuggestions([]);
    setSelectedSuggestion(null);
  };

  const handleSearch = async () => {
    if (!form.patientCondition) return setError('Please select patient condition.');
    setError('');
    setLoadingSuggestions(true);
    setSelectedSuggestion(null);
    try {
      const params = { requiredResources: form.requiredResources };
      const res = await getSuggestedHospitals(params);
      setSuggestions(res.data.data);
    } catch {
      setError('Failed to load suggestions. Please try again.');
    }
    setLoadingSuggestions(false);
  };

  const handleConfirm = async () => {
    if (!selectedSuggestion) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await createTransfer({
        patientCondition: form.patientCondition,
        currentHospital: form.currentHospital,
        requiredResources: form.requiredResources,
        targetHospital: selectedSuggestion.hospital._id,
      });
      setTransferResult(res.data.data);
      setConfirmed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer request failed.');
    }
    setSubmitting(false);
  };

  const handleReset = () => {
    setForm({ currentHospital: '', patientCondition: '', requiredResources: [] });
    setSuggestions([]);
    setSelectedSuggestion(null);
    setConfirmed(false);
    setTransferResult(null);
    setError('');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 page-enter">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-[48px] leading-none tracking-wide"
          style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
        >
          Patient Transfer System
        </h1>
        <p className="font-monda text-gray-500 mt-1">
          Find the best hospital match and coordinate patient transfers
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-100">
        {[{ key: 'new', label: 'New Transfer' }, { key: 'history', label: `Transfer History (${pastTransfers.length})` }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 font-monda text-sm font-bold border-b-2 transition-all -mb-px ${
              activeTab === t.key
                ? 'border-[#EB5E28] text-[#EB5E28]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── NEW TRANSFER ── */}
      {activeTab === 'new' && (
        <>
          {confirmed && transferResult ? (
            /* ── Success panel ── */
            <div className="max-w-xl mx-auto">
              <div className="card p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h2
                  className="text-[32px] tracking-wide mb-2"
                  style={{ fontFamily: '"Bebas Neue", cursive', color: '#22c55e' }}
                >
                  Transfer Confirmed
                </h2>
                <p className="font-monda text-gray-500 text-sm mb-6">
                  Your transfer request has been submitted successfully.
                </p>

                <div className="text-left bg-gray-50 rounded-2xl p-5 mb-6 space-y-3">
                  {[
                    ['Target Hospital', transferResult.targetHospital?.name],
                    ['Patient Condition', transferResult.patientCondition],
                    ['Required Resources', transferResult.requiredResources?.join(', ') || '—'],
                    ['Estimated ETA', transferResult.estimatedETA],
                    ['Status', null],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-monda text-sm text-gray-500">{label}</span>
                      {label === 'Status'
                        ? <StatusBadge status={transferResult.status?.toLowerCase()} />
                        : <span className="font-monda text-sm font-bold text-gray-800">{val}</span>
                      }
                    </div>
                  ))}
                </div>

                <button onClick={handleReset} className="btn-filled w-full">
                  New Transfer Request
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* ── Left: Form ── */}
              <div className="lg:col-span-2 space-y-5">
                <div className="card p-6">
                  <h2
                    className="text-[24px] mb-5"
                    style={{ fontFamily: '"Bebas Neue", cursive', color: '#EB5E28' }}
                  >
                    Patient Details
                  </h2>

                  {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-monda text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Current Hospital</label>
                      <input
                        type="text"
                        placeholder="Hospital name or location"
                        value={form.currentHospital}
                        onChange={e => setForm({ ...form, currentHospital: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Patient Condition</label>
                      <select
                        value={form.patientCondition}
                        onChange={e => setForm({ ...form, patientCondition: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Select condition…</option>
                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-monda text-sm font-bold text-gray-700">Required Resources</label>
                      <div className="grid grid-cols-2 gap-2">
                        {RESOURCES.map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => toggleResource(r)}
                            className={`rounded-xl px-3 py-2.5 font-monda text-xs font-bold border-2 text-left transition-all ${
                              form.requiredResources.includes(r)
                                ? 'border-[#EB5E28] bg-[#EB5E28]/5 text-[#EB5E28]'
                                : 'border-gray-200 text-gray-600 hover:border-[#EFA7A7]'
                            }`}
                          >
                            {form.requiredResources.includes(r) ? '✓ ' : ''}{r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSearch}
                      disabled={loadingSuggestions}
                      className="w-full rounded-full py-3 font-monda font-bold text-white transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #EB5E28 0%, #EFA7A7 100%)' }}
                    >
                      {loadingSuggestions ? 'Finding hospitals…' : 'Find Matching Hospitals'}
                    </button>
                  </div>
                </div>

                {/* Confirmation panel */}
                {selectedSuggestion && (
                  <div className="card p-6 border-2 border-[#EB5E28]/30">
                    <h3 className="font-roboto font-bold text-gray-800 mb-4">Confirm Transfer</h3>
                    <div className="space-y-2.5 mb-5">
                      {[
                        ['To', selectedSuggestion.hospital.name],
                        ['Condition', form.patientCondition || '—'],
                        ['Resources', form.requiredResources.join(', ') || 'None specified'],
                        ['ETA', selectedSuggestion.eta],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-start gap-2">
                          <span className="font-monda text-xs text-gray-400 whitespace-nowrap">{k}</span>
                          <span className="font-monda text-xs font-bold text-gray-700 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleConfirm}
                      disabled={submitting}
                      className="w-full rounded-full py-2.5 font-monda text-sm font-bold text-white bg-[#EB5E28] hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {submitting ? 'Confirming…' : 'Confirm Transfer →'}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Right: Suggested hospitals ── */}
              <div className="lg:col-span-3">
                {suggestions.length > 0 ? (
                  <>
                    <p className="font-monda text-sm text-gray-500 mb-4">
                      {suggestions.length} hospital{suggestions.length !== 1 ? 's' : ''} matched · select one to continue
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestions.map((s, i) => (
                        <SuggestedCard
                          key={i}
                          suggestion={s}
                          onSelect={setSelectedSuggestion}
                          selected={selectedSuggestion?.hospital}
                        />
                      ))}
                    </div>
                  </>
                ) : loadingSuggestions ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="card p-5 animate-pulse">
                        <div className="h-4 bg-gray-100 rounded mb-3 w-3/4" />
                        <div className="h-3 bg-gray-100 rounded mb-2" />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="h-12 bg-gray-100 rounded-lg" />
                          <div className="h-12 bg-gray-100 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <div className="w-20 h-20 rounded-full bg-[#EFA7A7]/10 flex items-center justify-center mb-4">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EFA7A7" strokeWidth="1.5">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                    <h3 className="font-roboto font-bold text-gray-600 text-lg">No hospitals yet</h3>
                    <p className="font-monda text-gray-400 text-sm mt-1 max-w-xs">
                      Fill in the patient details and click "Find Matching Hospitals" to see suggestions
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TRANSFER HISTORY ── */}
      {activeTab === 'history' && (
        <div>
          {loadingPast ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse flex gap-4">
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="w-24 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : pastTransfers.length > 0 ? (
            <div className="space-y-3">
              {pastTransfers.map(t => (
                <div key={t._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-roboto font-bold text-[15px] text-gray-800">
                        → {t.targetHospital?.name || 'Unknown Hospital'}
                      </h3>
                      <StatusBadge status={t.status?.toLowerCase()} />
                    </div>
                    <p className="font-monda text-xs text-gray-400">
                      From: {t.currentHospital || '—'} · Condition: {t.patientCondition}
                    </p>
                    {t.requiredResources?.length > 0 && (
                      <p className="font-monda text-xs text-gray-400 mt-0.5">
                        Resources: {t.requiredResources.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-monda text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {t.estimatedETA && (
                      <p className="font-monda text-xs font-bold text-[#EB5E28] mt-0.5">ETA: {t.estimatedETA}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EFA7A7]/10 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EFA7A7" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h3 className="font-roboto font-bold text-lg text-gray-700">No transfers yet</h3>
              <p className="font-monda text-gray-400 text-sm mt-1">Transfer requests will appear here</p>
              <button onClick={() => setActiveTab('new')} className="mt-4 btn-outline">
                Create Transfer Request
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
