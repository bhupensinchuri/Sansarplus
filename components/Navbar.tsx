
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookHeart, LogOut, User as UserIcon, Languages } from 'lucide-react';
import { useAuth, logout } from '../utils/auth';
import { getSiteLogo } from '../utils/dataManager';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');
  const { language, toggleLanguage } = useLanguage();
  // Local state to force re-render on auth changes if user details update
  const [, setTick] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleLogoChange = () => {
      getSiteLogo().then(setLogoUrl);
    };
    const handleAuthChange = () => {
      setTick(t => t + 1);
    }
    window.addEventListener('logo-change', handleLogoChange);
    window.addEventListener('auth-change', handleAuthChange);
    // Initial fetch
    getSiteLogo().then(setLogoUrl);
    return () => {
        window.removeEventListener('logo-change', handleLogoChange);
        window.removeEventListener('auth-change', handleAuthChange);
    }
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
                  <BookHeart className="text-white w-6 h-6" />
                </div>
            )}
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              SansarPlus
            </span>
          </Link>

          {/* Right Side Items */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-bold text-slate-700"
            >
                <Languages className="w-4 h-4" />
                <span>{language === 'english' ? 'EN' : 'ने'}</span>
            </button>

            {/* Auth Buttons */}
            {isAuth && user ? (
              <div className="flex items-center gap-2 md:gap-4">
                 {/* User Profile Link */}
                 <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-100 p-1.5 rounded-full pr-3 transition-colors group">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{user.name || user.username}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider bg-slate-100 px-1.5 rounded">{user.role === 'USER' ? 'Member' : 'Admin'}</span>
                    </div>
                 </Link>
                 
                 <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Logout"
                 >
                    <LogOut className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              // Public registration hidden. Admin login accessible via Menu.
              null
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
