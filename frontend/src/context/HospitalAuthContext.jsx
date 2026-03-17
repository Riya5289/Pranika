import { createContext, useContext, useState, useEffect } from 'react';

const HospitalAuthContext = createContext(null);

export const HospitalAuthProvider = ({ children }) => {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pranika_hospital');
    const token  = localStorage.getItem('pranika_hospital_token');
    if (stored && token) setHospital(JSON.parse(stored));
    setLoading(false);
  }, []);

  const loginHospital = (token, data) => {
    localStorage.setItem('pranika_hospital_token', token);
    localStorage.setItem('pranika_hospital', JSON.stringify(data));
    // Also set as the main api token so api.js picks it up
    localStorage.setItem('pranika_token', token);
    setHospital(data);
  };

  const logoutHospital = () => {
    localStorage.removeItem('pranika_hospital_token');
    localStorage.removeItem('pranika_hospital');
    localStorage.removeItem('pranika_token');
    setHospital(null);
  };

  return (
    <HospitalAuthContext.Provider value={{ hospital, loading, loginHospital, logoutHospital }}>
      {children}
    </HospitalAuthContext.Provider>
  );
};

export const useHospitalAuth = () => useContext(HospitalAuthContext);