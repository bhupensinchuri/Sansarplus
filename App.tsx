
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Browse from './pages/Browse';
import SearchPage from './pages/SearchPage';
import ArtistPage from './pages/ArtistPage';
import LyricsPage from './pages/LyricsPage';
import MenuPage from './pages/MenuPage';
import FavoritesPage from './pages/FavoritesPage';
import CategoriesPage from './pages/CategoriesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Loader from './components/Loader';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';

const App: React.FC = () => {
  // API Key check removed as the app now runs on local data only.

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary selection:text-white pb-24">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Browse Routes */}
          <Route path="/browse/songs/:letter" element={<Browse mode="songs" />} />
          <Route path="/browse/artists/:letter" element={<Browse mode="artists" />} />
          {/* Default redirect for old links if any */}
          <Route path="/browse/:letter" element={<Navigate to="/browse/songs/:letter" replace />} />

          {/* New Feature Routes */}
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} /> {/* Admin Login */}
          <Route path="/user-login" element={<UserLoginPage />} />
          <Route path="/signup" element={<UserSignupPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Search & Details */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/search/:query" element={<SearchPage />} />
          <Route path="/artist/:name" element={<ArtistPage />} />
          <Route path="/lyrics/:artist/:song" element={<LyricsPage />} />
        </Routes>
        <BottomNav />
        <footer className="bg-white py-8 mt-20 border-t border-slate-200 mb-4 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} SansarPlus.</p>
            </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
