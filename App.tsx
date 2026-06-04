import React, { useEffect } from 'react';
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
import CategoryDetailsPage from './pages/CategoryDetailsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import UserProfilePage from './pages/UserProfilePage';
import TypeNepaliPage from './pages/TypeNepaliPage';
import DisclaimerPage from './pages/DisclaimerPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { recordVisit } from './utils/dataManager';
import { supabase } from './supabaseClient';

const App: React.FC = () => {

  useEffect(() => {
    const handleVisits = async () => {
        // Only increment db stats once per session to avoid spamming
        const sessionKey = 'sansarplus_visit_session';
        const hasVisited = sessionStorage.getItem(sessionKey);
        
        if (!hasVisited) {
            await recordVisit();
            sessionStorage.setItem(sessionKey, 'true');
        }
    };
    handleVisits();

    // Setup Presence for "Online Right Now" feature
    const channel = supabase.channel('online_users', {
      config: {
        presence: {
          key: Math.random().toString(36).substring(7) // Random session ID
        },
      },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
        channel.unsubscribe();
    };
  }, []);

  return (
    <LanguageProvider>
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
            <Route path="/category/:category" element={<CategoryDetailsPage />} />
            <Route path="/type-nepali" element={<TypeNepaliPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} /> {/* Admin Login */}
            <Route path="/user-login" element={<UserLoginPage />} />
            <Route path="/signup" element={<UserSignupPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Search & Details */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="/artist/:name" element={<ArtistPage />} />
            
            {/* NEW Short and Sweet URL for Song Lyrics */}
            <Route path="/l/:id" element={<LyricsPage />} />
            
            {/* Fallback for Legacy URLs (Redirects to Home if old params used, but ideally we'd map them) */}
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
    </LanguageProvider>
  );
};

export default App;