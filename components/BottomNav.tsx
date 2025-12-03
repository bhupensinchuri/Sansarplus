import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Menu } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`
          }
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink 
          to="/search" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`
          }
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">Search</span>
        </NavLink>

        <NavLink 
          to="/favorites" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`
          }
        >
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-medium">Favorite</span>
        </NavLink>

        <NavLink 
          to="/menu" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`
          }
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">Menu</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;