import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import {
  getHospitalDashboard, updateHospitalResources,
  logEquipmentTaken, logEquipmentReturned,
  upsertSpecialist, deleteSpecialist, getHospitalLogs
} from '../services/api';
import StatusBadge from '../components/StatusBadge';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const RESOURCE_TYPES = ['ICU Bed','General Bed','Ventilator'];
const SPECIALTIES = ['Cardiology','Neurology','Oncology','Emergency','Orthopedics','Pediatrics','Gynecology','Surgery','ICU','Transplant','Nephrology'];

export default function HospitalDashboard() {
  const { hospital, logoutHospital } = useHospitalAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Resource form state
  const [resForm, setResForm] = useState({
    icuBeds: { total: 0, available: 0 },
    generalBeds: { total: 0, available: 0 },
    ventilators: { total: 0, available: 0 },
    oxygen: 'Available'
  });

  // Equipment log form
  const [equipForm, setEquipForm] = useState({ resourceType: 'ICU Bed', takenBy: '', notes: '' });

  // Specialist form
  const [specForm, setSpecForm] = useState({
    specialistId: '', name: '', specialty: '', availableDays: [],
    availableFrom: '09:00', availableTo: '17:00', isAvailableToday: true, contact: ''
  });
  const [showSpecForm, setShowSpecForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getHospitalDashboard();
      setData(res.data.data);
      if (res.data.data.resource) {
        const r = res.data.data.resource;
        setResForm({
          icuBeds: r.icuBeds || { total: 0, available: 0 },
          generalBeds: r.generalBeds || { total: 0, available: 0 },
          ventilators: r.ventilators || { total: 0, available: 0 },
          oxygen: r.oxygen || 'Available'
        });
      }
    } catch {}
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await getHospitalLogs();
      setLogs(res.data.data);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (tab === 'logs') fetchLogs(); }, [tab]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleUpdateResources = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHospitalResources(resForm);
      flash('✓ Resources updated successfully');
      fetchData();
    } catch (err) {
      flash('Error: ' + (err.response?.data?.message || 'Update failed'));
    }
    setSaving(false);
  };

  const handleEquipTaken = async () => {
    if (!equipForm.takenBy) return flash('Please enter who is taking this equipment.');
    setSaving(true);
    try {
      await logEquipmentTaken(equipForm);
      flash(`✓ ${equipForm.resourceType} marked as taken by ${equipForm.takenBy}`);
      setEquipForm({ ...equipForm, takenBy: '', notes: '' });
      fetchData();
    } catch (err) { flash('Error: ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleEquipReturned = async () => {
    setSaving(true);
    try {
      await logEquipmentReturned({ resourceType: equipForm.resourceType, notes: equipForm.notes });
      flash(`✓ ${equipForm.resourceType} returned`);
      setEquipForm({ ...equipForm, notes: '' });
      fetchData();
    } catch (err) { flash('Error: ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleSpecSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertSpecialist(specForm);
      flash('✓ Specialist saved');
      setShowSpecForm(false);
      setSpecForm({ specialistId:'', name:'', specialty:'', availableDays:[], availableFrom:'09:00', availableTo:'17:00', isAvailableToday:true, contact:'' });
      fetchData();
    } catch (err) { flash('Error: ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleDeleteSpec = async (id) => {
    if (!confirm('Remove this specialist?')) return;
    await deleteSpecialist(id);
    flash('✓ Specialist removed');
    fetchData();
  };

  const editSpec = (s) => {
    setSpecForm({
      specialistId: s._id, name: s.name, specialty: s.specialty,
      availableDays: s.availableDays || [], availableFrom: s.availableFrom || '09:00',
      availableTo: s.availableTo || '17:00', isAvailableToday: s.isAvailableToday, contact: s.contact || ''
    });
    setShowSpecForm(true);
  };

  const r = data?.resource;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '48px', color: '#EB5E28', lineHeight: 1 }}>
            Hospital Dashboard
          </h1>
          <p className="font-monda text-gray-500 mt-1">{hospital?.hospitalName}</p>
        </div>
        <button onClick={() => { logoutHospital(); navigate('/hospital/login'); }}
          className="rounded-full border-2 border-gray-200 text-gray-500 font-monda text-sm font-bold px-4 py-2 hover:border-red-300 hover:text-red-500 transition-all">
          Logout
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl font-monda text-sm ${
          msg.startsWith('✓') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-100 overflow-x-auto">
        {[
          { key:'overview',   label:'Overview' },
          { key:'resources',  label:'Update Resources' },
          { key:'equipment',  label:'Equipment Log' },
          { key:'specialists',label:'Specialists' },
          { key:'logs',       label:'Activity Log' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 font-monda text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap ${
              tab === t.key ? 'border-[#EB5E28] text-[#EB5E28]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#EFA7A7] border-t-[#EB5E28] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === 'overview' && r && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label:'ICU Beds', avail: r.icuBeds?.available, total: r.icuBeds?.total, color:'#EB5E28' },
                  { label:'General Beds', avail: r.generalBeds?.available, total: r.generalBeds?.total, color:'#23B5D3' },
                  { label:'Ventilators', avail: r.ventilators?.available, total: r.ventilators?.total, color:'#EFA7A7' },
                  { label:'Oxygen', avail: r.oxygen, total: null, color:'#22c55e' },
                ].map(c => (
                  <div key={c.label} className="card p-5 text-center">
                    <div style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'42px', color: c.color, lineHeight:1 }}>
                      {c.total !== null ? c.avail : c.avail}
                    </div>
                    {c.total !== null && (
                      <div className="font-monda text-xs text-gray-400 mt-1">of {c.total} total</div>
                    )}
                    <div className="font-monda text-sm font-bold text-gray-600 mt-2">{c.label}</div>
                    {c.total !== null && (
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: c.total > 0 ? `${Math.round((c.avail/c.total)*100)}%` : '0%', background: c.color }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Specialists summary */}
              <div className="card p-6">
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:'16px', marginBottom:'16px' }}>
                  Today's Specialists ({data?.specialists?.filter(s => s.isAvailableToday).length || 0} available)
                </h3>
                {data?.specialists?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.specialists.map(s => (
                      <div key={s._id} className={`flex items-center gap-3 p-3 rounded-xl ${s.isAvailableToday ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.isAvailableToday ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <div className="font-monda text-sm font-bold text-gray-800">{s.name}</div>
                          <div className="font-monda text-xs text-gray-500">{s.specialty} · {s.availableFrom}–{s.availableTo}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-monda text-sm text-gray-400">No specialists added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ── UPDATE RESOURCES ── */}
          {tab === 'resources' && (
            <div className="max-w-xl">
              <form onSubmit={handleUpdateResources} className="card p-8 flex flex-col gap-6">
                <h2 style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'32px', color:'#EB5E28' }}>Update Bed & Equipment Counts</h2>
                <p className="font-monda text-sm text-gray-500 -mt-4">Set the total and currently available counts for today.</p>

                {[
                  { label:'ICU Beds', key:'icuBeds' },
                  { label:'General Beds', key:'generalBeds' },
                  { label:'Ventilators', key:'ventilators' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="font-monda text-sm font-bold text-gray-700 block mb-2">{f.label}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-monda text-xs text-gray-400 block mb-1">Total</span>
                        <input type="number" min="0" value={resForm[f.key].total}
                          onChange={e => setResForm({ ...resForm, [f.key]: { ...resForm[f.key], total: parseInt(e.target.value)||0 } })}
                          className="input-field" />
                      </div>
                      <div>
                        <span className="font-monda text-xs text-gray-400 block mb-1">Currently Available</span>
                        <input type="number" min="0" value={resForm[f.key].available}
                          onChange={e => setResForm({ ...resForm, [f.key]: { ...resForm[f.key], available: parseInt(e.target.value)||0 } })}
                          className="input-field" />
                      </div>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="font-monda text-sm font-bold text-gray-700 block mb-2">Oxygen Status</label>
                  <select value={resForm.oxygen} onChange={e => setResForm({...resForm, oxygen: e.target.value})} className="input-field">
                    {['Available','Limited','Unavailable'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full rounded-full py-3 font-monda font-bold text-white disabled:opacity-60"
                  style={{ background:'linear-gradient(135deg,#EB5E28,#EFA7A7)' }}>
                  {saving ? 'Saving…' : 'Save Resource Counts'}
                </button>
              </form>
            </div>
          )}

          {/* ── EQUIPMENT LOG ── */}
          {tab === 'equipment' && (
            <div className="max-w-xl space-y-6">
              <div className="card p-8">
                <h2 style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'32px', color:'#EB5E28', marginBottom:'20px' }}>Log Equipment Usage</h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-monda text-sm font-bold text-gray-700 block mb-1.5">Resource Type</label>
                    <select value={equipForm.resourceType} onChange={e => setEquipForm({...equipForm, resourceType: e.target.value})} className="input-field">
                      {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-monda text-sm font-bold text-gray-700 block mb-1.5">Taken By (Patient / Ward / Staff)</label>
                    <input type="text" value={equipForm.takenBy} onChange={e => setEquipForm({...equipForm, takenBy: e.target.value})}
                      placeholder="e.g. Patient ID 1042 / ICU Ward B" className="input-field" />
                  </div>
                  <div>
                    <label className="font-monda text-sm font-bold text-gray-700 block mb-1.5">Notes (optional)</label>
                    <input type="text" value={equipForm.notes} onChange={e => setEquipForm({...equipForm, notes: e.target.value})}
                      placeholder="Any additional notes" className="input-field" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={handleEquipTaken} disabled={saving}
                      className="rounded-full py-3 font-monda font-bold text-white disabled:opacity-60"
                      style={{ background:'#EB5E28' }}>
                      ↓ Mark as Taken
                    </button>
                    <button onClick={handleEquipReturned} disabled={saving}
                      className="rounded-full py-3 font-monda font-bold border-2 border-[#EB5E28] text-[#EB5E28] hover:bg-[#EB5E28] hover:text-white transition-all disabled:opacity-60">
                      ↑ Mark as Returned
                    </button>
                  </div>
                </div>
              </div>

              {/* Current counts summary */}
              {r && (
                <div className="card p-5">
                  <h3 className="font-roboto font-bold text-sm text-gray-700 mb-3">Current Availability</h3>
                  <div className="space-y-2">
                    {[
                      { label:'ICU Beds', val:`${r.icuBeds?.available}/${r.icuBeds?.total}` },
                      { label:'General Beds', val:`${r.generalBeds?.available}/${r.generalBeds?.total}` },
                      { label:'Ventilators', val:`${r.ventilators?.available}/${r.ventilators?.total}` },
                    ].map(i => (
                      <div key={i.label} className="flex justify-between font-monda text-sm">
                        <span className="text-gray-500">{i.label}</span>
                        <span className="font-bold text-gray-800">{i.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SPECIALISTS ── */}
          {tab === 'specialists' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'32px', color:'#EB5E28' }}>Specialists</h2>
                <button onClick={() => { setSpecForm({ specialistId:'',name:'',specialty:'',availableDays:[],availableFrom:'09:00',availableTo:'17:00',isAvailableToday:true,contact:'' }); setShowSpecForm(true); }}
                  className="btn-filled">+ Add Specialist</button>
              </div>

              {/* Add / Edit form */}
              {showSpecForm && (
                <div className="card p-6">
                  <h3 className="font-roboto font-bold text-lg mb-5">{specForm.specialistId ? 'Edit' : 'Add'} Specialist</h3>
                  <form onSubmit={handleSpecSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Name</label>
                      <input type="text" value={specForm.name} onChange={e => setSpecForm({...specForm, name: e.target.value})}
                        placeholder="Dr. Name" className="input-field" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Specialty</label>
                      <select value={specForm.specialty} onChange={e => setSpecForm({...specForm, specialty: e.target.value})} className="input-field">
                        <option value="">Select…</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Available From</label>
                      <input type="time" value={specForm.availableFrom} onChange={e => setSpecForm({...specForm, availableFrom: e.target.value})} className="input-field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Available To</label>
                      <input type="time" value={specForm.availableTo} onChange={e => setSpecForm({...specForm, availableTo: e.target.value})} className="input-field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-monda text-sm font-bold text-gray-700">Contact</label>
                      <input type="text" value={specForm.contact} onChange={e => setSpecForm({...specForm, contact: e.target.value})}
                        placeholder="+91-XXXXXXXXXX" className="input-field" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-monda text-sm font-bold text-gray-700">Available Days</label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(d => (
                          <button key={d} type="button"
                            onClick={() => setSpecForm(f => ({ ...f, availableDays: f.availableDays.includes(d) ? f.availableDays.filter(x=>x!==d) : [...f.availableDays, d] }))}
                            className={`px-2.5 py-1 rounded-full text-xs font-monda font-bold border-2 transition-all ${
                              specForm.availableDays.includes(d) ? 'border-[#EB5E28] bg-[#EB5E28]/5 text-[#EB5E28]' : 'border-gray-200 text-gray-500'
                            }`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <input type="checkbox" id="avail-today" checked={specForm.isAvailableToday}
                        onChange={e => setSpecForm({...specForm, isAvailableToday: e.target.checked})}
                        className="w-4 h-4 accent-[#EB5E28]" />
                      <label htmlFor="avail-today" className="font-monda text-sm text-gray-700">Available Today</label>
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="submit" disabled={saving}
                        className="flex-1 rounded-full py-2.5 font-monda font-bold text-white disabled:opacity-60"
                        style={{ background:'linear-gradient(135deg,#EB5E28,#EFA7A7)' }}>
                        {saving ? 'Saving…' : 'Save Specialist'}
                      </button>
                      <button type="button" onClick={() => setShowSpecForm(false)}
                        className="px-5 rounded-full border-2 border-gray-200 font-monda text-sm text-gray-500 hover:border-gray-300">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Specialists list */}
              {data?.specialists?.length > 0 ? (
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor:'#EFA7A7' }}>
                        {['Name','Specialty','Days','Time','Today','Contact','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-monda text-xs font-bold text-white uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.specialists.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-roboto font-bold text-sm text-gray-800">{s.name}</td>
                          <td className="px-4 py-3 font-monda text-sm text-gray-600">{s.specialty}</td>
                          <td className="px-4 py-3 font-monda text-xs text-gray-500">{s.availableDays?.join(', ') || '—'}</td>
                          <td className="px-4 py-3 font-monda text-xs text-gray-500">{s.availableFrom}–{s.availableTo}</td>
                          <td className="px-4 py-3"><StatusBadge status={s.isAvailableToday ? 'available' : 'full'} /></td>
                          <td className="px-4 py-3 font-monda text-xs text-gray-500">{s.contact || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => editSpec(s)} className="font-monda text-xs font-bold text-[#EB5E28] hover:underline">Edit</button>
                              <button onClick={() => handleDeleteSpec(s._id)} className="font-monda text-xs font-bold text-red-400 hover:underline">Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="font-monda text-gray-400 text-sm">No specialists added yet. Click "+ Add Specialist" to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY LOG ── */}
          {tab === 'logs' && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor:'#EFA7A7' }}>
                    {['Resource','Action','Previous','New Value','Notes','When'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-monda text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length > 0 ? logs.map(l => (
                    <tr key={l._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-monda text-sm font-bold text-gray-700">{l.resourceType}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.action === 'taken' ? 'full' : l.action === 'returned' ? 'available' : 'limited'} /></td>
                      <td className="px-4 py-3 font-monda text-xs text-gray-500">{JSON.stringify(l.previousValue)}</td>
                      <td className="px-4 py-3 font-monda text-xs text-gray-700 font-bold">{JSON.stringify(l.newValue)}</td>
                      <td className="px-4 py-3 font-monda text-xs text-gray-400">{l.notes || (l.takenBy ? `Taken by: ${l.takenBy}` : '—')}</td>
                      <td className="px-4 py-3 font-monda text-xs text-gray-400 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-4 py-12 text-center font-monda text-sm text-gray-400">No activity logged yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}