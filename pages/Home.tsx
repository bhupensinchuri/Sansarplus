import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Music, Disc, Mic2, ArrowRight } from 'lucide-react';
import { getTrendingContent } from '../services/geminiService';
import Loader from '../components/Loader';
import AlphabetNav from '../components/AlphabetNav';
import { HomeData } from '../types';

const Home: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      const result = await getTrendingContent();
      setData(result);
      setLoading(false);
    };
    fetchTrending();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput)}`);
    }
  };

  if (loading) return <Loader fullScreen text="Loading content..." />;

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      
      {/* Search Bar Section */}
      <div className="bg-white border-b border-slate-200 py-6 px-4">
          <div className="max-w-3xl mx-auto relative">
             <form onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search songs, artists, or lyrics..."
                    className="w-full bg-slate-100 border-none rounded-full py-3 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-inner"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
             </form>
          </div>
      </div>

      {/* A-Z Navigation */}
      <AlphabetNav />

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
         <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
               <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
               <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm font-sans">Praise and Worship</h1>
               <p className="text-lg md:text-xl text-indigo-50 max-w-2xl mx-auto leading-relaxed font-medium">
                  The largest collection of Nepali Christian lyrics and hymns, connect with God through music.
               </p>
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Trending Songs Column */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Music className="w-6 h-6 mr-2 text-primary" /> Trending Songs
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {data?.trendingSongs.map((song, idx) => (
              <Link 
                key={idx}
                to={`/lyrics/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
                className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 last:border-0 group transition-colors"
              >
                 <div className="flex items-center overflow-hidden">
                    <span className="text-slate-400 font-mono text-sm w-6 flex-shrink-0">{idx + 1}</span>
                    <div className="truncate">
                       <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors truncate">{song.title}</h3>
                       <p className="text-xs text-slate-500 truncate">{song.artist}</p>
                    </div>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Artists Column */}
        <div>
           <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Mic2 className="w-6 h-6 mr-2 text-secondary" /> Popular Artists
          </h2>
           <div className="grid grid-cols-1 gap-3">
              {data?.popularArtists.map((artist, idx) => (
                 <Link 
                    key={idx}
                    to={`/artist/${encodeURIComponent(artist)}`}
                    className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-secondary/50 hover:shadow-md transition-all group"
                 >
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 border border-slate-100 group-hover:border-secondary transition-colors">
                        <img 
                            src={`https://picsum.photos/seed/${encodeURIComponent(artist)}/200`} 
                            alt={artist} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                    </div>
                    <span className="font-semibold text-slate-800 group-hover:text-secondary transition-colors flex-1">{artist}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-secondary" />
                 </Link>
              ))}
           </div>
        </div>

      </div>

    </div>
  );
};

export default Home;