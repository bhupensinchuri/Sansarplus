
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, LogIn, UserPlus, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth, getCurrentUser, logout } from '../utils/auth';
import { getSiteLogo } from '../utils/dataManager';

const Navbar: React.FC = () => {
  const isAuth = useAuth();
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState(getSiteLogo());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleLogoChange = () => {
      setLogoUrl(getSiteLogo());
    };
    window.addEventListener('logo-change', handleLogoChange);
    return () => window.removeEventListener('logo-change', handleLogoChange);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full relative">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            {logoUrl ? (
                <img 
                    src={logoUrl} 
                    alt="SansarPlus" 
                    className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300" 
                />
            ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                  <Music2 className="text-white w-6 h-6" />
                </div>
            )}
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              SansarPlus
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuth && user ? (
              <div className="flex items-center gap-2 md:gap-4">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900">{user.name || user.username}</span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider bg-slate-100 px-1.5 rounded">{user.role === 'USER' ? 'Member' : 'Admin'}</span>
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Logout"
                 >
                    <LogOut className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                 <Link to="/user-login" className="hidden md:flex items-center px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                    Login
                 </Link>
                 <Link to="/signup" className="flex items-center px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                    <UserPlus className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Sign Up</span><span className="md:hidden">Join</span>
                 </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
