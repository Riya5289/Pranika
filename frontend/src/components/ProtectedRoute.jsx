import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#EFA7A7] border-t-[#EB5E28] rounded-full animate-spin" />
          <p className="font-monda text-gray-400 text-sm">Loading Pranika…</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
