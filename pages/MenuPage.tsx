import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, User, Phone, ListMusic, Grid, ChevronRight } from 'lucide-react';

const MenuPage: React.FC = () => {
  const menuItems = [
    { title: 'Browse Songs A-Z', icon: ListMusic, path: '/browse/songs/A', color: 'text-primary bg-primary/10' },
    { title: 'Browse Artists A-Z', icon: User, path: '/browse/artists/A', color: 'text-secondary bg-secondary/10' },
    { title: 'Music Categories', icon: Grid, path: '/categories', color: 'text-emerald-500 bg-emerald-100' },
    { title: 'Contact Us', icon: Phone, path: '/contact', color: 'text-orange-500 bg-orange-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Menu</h1>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {menuItems.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.path}
              className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-800 text-lg">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
           <Music2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 text-sm">
             SansarPlus v1.0
             <br/>
             Nepali Christian Lyrics & Chords.
           </p>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;