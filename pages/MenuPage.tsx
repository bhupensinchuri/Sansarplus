
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, User, Phone, ListMusic, Grid, Lock, ShieldCheck, HeartHandshake, UserCircle, Keyboard, Search, ShieldAlert } from 'lucide-react';
import { useAuth } from '../utils/auth';

const MenuPage: React.FC = () => {
  const { isAuth } = useAuth();

  const menuItems = [
    { 
        title: 'Songs A-Z', 
        description: 'Browse lyrics alphabetically',
        icon: ListMusic, 
        path: '/browse/songs/A', 
        gradient: 'from-blue-500 to-cyan-500' 
    },
    { 
        title: 'Artists', 
        description: 'Find your favorite artists',
        icon: User, 
        path: '/browse/artists/A', 
        gradient: 'from-purple-500 to-pink-500' 
    },
    { 
        title: 'Search',
        description: 'Find songs and lyrics',
        icon: Search,
        path: '/search',
        gradient: 'from-amber-400 to-orange-500'
    },
    { 
        title: 'Categories', 
        description: 'Explore genres & themes',
        icon: Grid, 
        path: '/categories', 
        gradient: 'from-emerald-500 to-teal-500' 
    },
    { 
        title: 'Type In Nepali', 
        description: 'English to Nepali Converter',
        icon: Keyboard, 
        path: '/type-nepali', 
        gradient: 'from-fuchsia-600 to-purple-600' 
    },
    { 
        title: 'Donate', 
        description: 'Support our free library',
        icon: HeartHandshake, 
        path: 'https://www.paypal.com/donate/?business=GMLA7WGYWRSNJ&no_recurring=0&item_name=Your+donations+help+us+maintain+and+expand+this+free+library+of+SansarPlus.+Every+contribution+makes+a+difference%21&currency_code=USD', 
        gradient: 'from-rose-500 to-pink-600',
        external: true
    },
    { 
        title: 'Contact Us', 
        description: 'Get in touch for support',
        icon: Phone, 
        path: '/contact', 
        gradient: 'from-orange-500 to-amber-500' 
    },
    { 
        title: 'Disclaimer', 
        description: 'Legal information & copyright',
        icon: ShieldAlert, 
        path: '/disclaimer', 
        gradient: 'from-slate-500 to-slate-700' 
    },
  ];

  // Add User Profile link if authenticated
  if (isAuth) {
      menuItems.unshift({
        title: 'My Profile',
        description: 'Edit photo & details',
        icon: UserCircle,
        path: '/profile',
        gradient: 'from-indigo-500 to-violet-500'
      });
  }

  const adminItem = isAuth ? {
      title: 'Dashboard',
      description: 'Manage content',
      icon: ShieldCheck,
      path: '/admin/dashboard',
      gradient: 'from-slate-700 to-slate-900'
  } : {
      title: 'Admin Login',
      description: 'Authorized access only',
      icon: Lock,
      path: '/login',
      gradient: 'from-slate-400 to-slate-600'
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 pb-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Menu</h1>
        <p className="text-slate-500 mb-8">Explore SansarPlus</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item, idx) => {
            const content = (
               <>
               <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
               
               <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7" />
               </div>
               
               <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
               <p className="text-sm text-slate-500">{item.description}</p>
               </>
            );

            const commonClasses = "group relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300";

            if (item.external) {
                return (
                    <a 
                        key={idx}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={commonClasses}
                    >
                        {content}
                    </a>
                );
            }

            return (
                <Link 
                  key={idx} 
                  to={item.path}
                  className={commonClasses}
                >
                   {content}
                </Link>
            );
          })}

          {/* Admin Card */}
          <Link 
              to={adminItem.path}
              className="group relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 sm:col-span-2"
            >
               <div className={`absolute inset-0 bg-gradient-to-br ${adminItem.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
               
               <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${adminItem.gradient} flex items-center justify-center text-white shadow-md mr-5 group-hover:scale-110 transition-transform duration-300`}>
                        <adminItem.icon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{adminItem.title}</h3>
                        <p className="text-sm text-slate-500">{adminItem.description}</p>
                    </div>
               </div>
            </Link>
        </div>

        <div className="mt-12 text-center">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
               <BookHeart className="w-8 h-8 text-indigo-500" />
           </div>
           <p className="font-bold text-slate-900">SansarPlus</p>
           <p className="text-slate-400 text-xs mt-1">
             v1.0.0 &bull; Nepali Christian Lyrics
           </p>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
