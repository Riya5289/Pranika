import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `font-monda text-[15px] transition-colors duration-150 ${
      isActive ? 'text-white font-bold underline underline-offset-4' : 'text-white/80 hover:text-white'
    }`;

  return (
    <header
      className="w-full sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: '#EFA7A7', height: '80px' }}
    >
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/hospitals" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.25" />
              <path d="M16 6v20M6 16h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M10 10l12 12M22 10L10 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
            <span
              className="text-white tracking-widest select-none"
              style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '36px', lineHeight: 1 }}
            >
              Pranika
            </span>
          </div>
        </Link>

        {/* Nav */}
        {user && (
          <nav className="flex items-center gap-8">
            <NavLink to="/hospitals" className={navLinkClass}>Hospitals</NavLink>
            <NavLink to="/availability" className={navLinkClass}>Live Availability</NavLink>
            <NavLink to="/transfer" className={navLinkClass}>Transfers</NavLink>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white text-white bg-transparent font-monda font-bold px-5 py-1.5 text-[14px] hover:bg-white hover:text-[#EFA7A7] transition-all duration-200"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
