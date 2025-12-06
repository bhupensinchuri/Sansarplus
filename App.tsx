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
import { Key } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for environments without the wrapper, assume key is in env
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Re-check after selection
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
      if (hasKey) {
          // Force reload to pick up new env vars if necessary, though
          // dynamic service instantiation usually handles it.
          window.location.reload(); 
      }
    }
  };

  if (hasApiKey === null) {
    return <Loader fullScreen text="Initializing..." />;
  }

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <Key className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">API Key Required</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          To use SansarPlus, please select a valid Google Gemini API Key.
          <br/>This is required to generate lyrics and fetch content.
        </p>
        <button 
            onClick={handleSelectKey}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
        >
            Select API Key
        </button>
        <p className="mt-8 text-xs text-slate-400">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
                View Billing Documentation
            </a>
        </p>
      </div>
    );
  }

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
          
          {/* Admin Routes */}
          <Route path="/login" element={<LoginPage />} />
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