import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import Availability from './pages/Availability';
import Transfer from './pages/Transfer';
import { HospitalAuthProvider } from './context/HospitalAuthContext';
import HospitalLogin from './pages/HospitalLogin';
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HospitalAuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />

          {/* Protected */}
          <Route path="/hospitals" element={
            <ProtectedRoute><Layout><Hospitals /></Layout></ProtectedRoute>
          } />
          <Route path="/hospitals/:id" element={
            <ProtectedRoute><Layout><HospitalDetail /></Layout></ProtectedRoute>
          } />
          <Route path="/availability" element={
            <ProtectedRoute><Layout><Availability /></Layout></ProtectedRoute>
          } />
          <Route path="/transfer" element={
            <ProtectedRoute><Layout><Transfer /></Layout></ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/hospitals" replace />} />
          <Route path="/hospital" element={<Navigate to="/hospital/login" replace />} />
          <Route path="/hospital/login" element={<Layout><HospitalLogin /></Layout>} />
          <Route path="/hospital/signup" element={<Layout><HospitalSignup /></Layout>} />
          <Route path="/hospital/dashboard" element={<Layout><HospitalDashboard /></Layout>} />
          <Route path="*" element={<Navigate to="/hospitals" replace />} />
        </Routes>
        </HospitalAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
