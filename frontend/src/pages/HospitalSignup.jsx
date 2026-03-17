import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalSignup } from '../services/api';
import { getCurrentLocation } from '../utils/distance';
import CaptchaField from '../components/CaptchaField';

const TYPES = ['Government', 'Private', 'Trust', 'Clinic'];
const SPECIALTY_OPTIONS = ['Cardiology','Neurology','Oncology','Emergency','Orthopedics','Pediatrics','Gynecology','Surgery','ICU','Transplant','Nephrology'];

export default function HospitalSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospitalName: '', email: '', password: '', confirmPassword: '',
    phone: '', address: '', hospitalType: 'Private',
    lat: '', lng: '', specialties: []
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);


  const toggleSpecialty = (s) =>
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter(x => x !== s)
        : [...f.specialties, s]
    }));

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    setError('');
    try {
      const location = await getCurrentLocation();
      setForm(prev => ({
        ...prev,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        address: 'Fetching address...'
      }));

      // Reverse geocode to get address
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: location.lat, lng: location.lng };
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setForm(prev => ({
              ...prev,
              address: results[0].formatted_address
            }));
          } else {
            setForm(prev => ({
              ...prev,
              address: 'Unable to fetch address, please enter manually'
            }));
          }
        });
      } else {
        // Fallback if no Google Maps
        setForm(prev => ({
          ...prev,
          address: 'Unable to fetch address, please enter manually'
        }));
      }

      // Update map
      if (map) {
        const loc = { lat: location.lat, lng: location.lng };
        map.setCenter(loc);
        map.setZoom(15);
        if (marker) {
          marker.setPosition(loc);
        } else {
          const newMarker = new window.google.maps.Marker({
            position: loc,
            map: map
          });
          setMarker(newMarker);
        }
      }
    } catch (err) {
      setError('Unable to get your location. Please check location permissions.');
    }
    setLoadingLocation(false);
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
          setError('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env file.');
          return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // Initialize map after script loads
          if (mapRef.current && !map) {
            const initialMap = new window.google.maps.Map(mapRef.current, {
              center: { lat: 20.5937, lng: 78.9629 }, // Center of India
              zoom: 5,
              disableDefaultUI: true
            });
            setMap(initialMap);
          }
        };
        script.onerror = () => {
          setError('Failed to load Google Maps API. Please check your API key and internet connection.');
        };
        document.head.appendChild(script);
      } else if (window.google && mapRef.current && !map) {
        const initialMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // Center of India
          zoom: 5,
          disableDefaultUI: true
        });
        setMap(initialMap);
      }
    };

    loadGoogleMaps();
  }, [map]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!form.lat || !form.lng) return setError('Please get your current location to fill coordinates.');
    if (!captchaAnswer) return setError('Please answer the security check.');
    setLoading(true);
    try {
      await hospitalSignup({ ...form, captchaId, captchaAnswer });
      setSuccess('Hospital registered! Redirecting to login…');
      setTimeout(() => navigate('/hospital/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
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
      <div className="w-full max-w-xl">
        <div className="card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '48px', color: '#EB5E28', letterSpacing: '2px' }}>
              Register Hospital
            </h1>
            <p className="font-monda text-gray-500 text-sm mt-1">Join the Pranika healthcare network</p>
          </div>

          {error   && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-monda text-sm">{error}</div>}
          {success && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-monda text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Hospital Name</label>
              <input type="text" value={form.hospitalName} onChange={e => setForm({...form, hospitalName: e.target.value})}
                placeholder="e.g. City General Hospital" className="input-field" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="admin@hospital.com" className="input-field" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+91-XXXXXXXXXX" className="input-field" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Address</label>
              <div className="flex gap-2">
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Address will be auto-filled from location" className="input-field flex-1" />
                <button type="button" onClick={handleGetLocation} disabled={loadingLocation}
                  className="px-4 py-2 bg-[#EB5E28] text-white rounded-lg font-monda text-sm disabled:opacity-50">
                  {loadingLocation ? 'Getting...' : 'Get Location'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Hospital Type</label>
                <select value={form.hospitalType} onChange={e => setForm({...form, hospitalType: e.target.value})} className="input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Latitude</label>
                <input type="text" value={form.lat} readOnly
                  placeholder="Auto-filled" className="input-field bg-gray-50" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Longitude</label>
                <input type="text" value={form.lng} readOnly
                  placeholder="Auto-filled" className="input-field bg-gray-50" required />
              </div>
              <div className="flex flex-col gap-1.5">
                {/* Empty for balance */}
              </div>
            </div>

            {/* Map Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Location Preview</label>
              <div ref={mapRef} style={{ height: '200px', width: '100%' }} className="border rounded-lg"></div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-monda text-sm font-bold text-gray-700">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                    className={`rounded-full px-3 py-1 text-xs font-monda font-bold border-2 transition-all ${
                      form.specialties.includes(s)
                        ? 'border-[#EB5E28] bg-[#EB5E28]/5 text-[#EB5E28]'
                        : 'border-gray-200 text-gray-500 hover:border-[#EFA7A7]'
                    }`}>
                    {form.specialties.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 6 characters" className="input-field" required minLength={6} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-monda text-sm font-bold text-gray-700">Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="Repeat password" className="input-field" required />
              </div>
            </div>

            <CaptchaField value={captchaAnswer} onChange={setCaptchaAnswer} onIdChange={setCaptchaId} />

            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-full py-3 font-monda font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #EB5E28 0%, #EFA7A7 100%)' }}>
              {loading ? 'Registering…' : 'Register Hospital'}
            </button>
            <div className="text-center">
              <Link to="/hospital/login" className="font-monda text-sm text-[#EB5E28] hover:underline">Already registered? Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}