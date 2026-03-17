import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pranika_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pranika_token');
      localStorage.removeItem('pranika_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const getCaptcha = () => api.get('/captcha/generate');
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);

// Hospitals
export const getHospitals = (params) => api.get('/hospitals', { params });
export const getNearbyHospitals = (params) => api.get('/hospitals/nearby', { params });
export const getHospitalById = (id) => api.get(`/hospitals/${id}`);
export const seedHospitals = () => api.get('/hospitals/seed');

// Resources
export const getResources = (params) => api.get('/resources', { params });
export const seedResources = () => api.get('/resources/seed');

// Transfers
export const createTransfer = (data) => api.post('/transfers', data);
export const getTransfers = () => api.get('/transfers');
export const getSuggestedHospitals = (params) => api.get('/transfers/suggestions', { params });

// Hospital Auth
export const hospitalSignup = (data) => api.post('/hospital-auth/signup', data);
export const hospitalLogin  = (data) => api.post('/hospital-auth/login', data);

// Hospital Dashboard
export const getHospitalDashboard    = () => api.get('/hospital/dashboard');
export const updateHospitalResources = (data) => api.put('/hospital/resources', data);
export const logEquipmentTaken       = (data) => api.post('/hospital/equipment/taken', data);
export const logEquipmentReturned    = (data) => api.post('/hospital/equipment/returned', data);
export const upsertSpecialist        = (data) => api.post('/hospital/specialists', data);
export const deleteSpecialist        = (id) => api.delete(`/hospital/specialists/${id}`);
export const getHospitalLogs         = () => api.get('/hospital/logs');

// Specialists (user-facing)
export const getSpecialists = (params) => api.get('/specialists', { params });

export default api;
