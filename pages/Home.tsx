
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Music, Disc, Mic2, ArrowRight, Play, Star, ChevronLeft, Database } from 'lucide-react';
import { getTrendingContent } from '../services/geminiService';
import Loader from '../components/Loader';
import AlphabetNav from '../components/AlphabetNav';
import { HomeData, Banner } from '../types';
import { getBanners, getAllCustomSongs } from '../utils/dataManager';

const Home: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const trendingResult = await getTrendingContent();
      setData(trendingResult);
      setBanners(getBanners());
      // Get count of locally added songs
      const customSongs = getAllCustomSongs();
      setTotalSongs(customSongs.length);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Auto slide banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [banners]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput)}`);
    }
  };

  if (loading) return <Loader fullScreen text="Loading content..." />;

  return (
    <div className="min-h-screen pb-12 bg-slate-50 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-60"></div>
         <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Immersive Hero Section */}
      <div className="relative z-10 bg-slate-900 text-white pt-12 pb-24 md:pb-32 px-4 rounded-b-[3rem] shadow-2xl overflow-hidden">
          {/* Abstract Hero Background */}
          <div className="absolute inset-0 z-0 opacity-20">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 text-sm font-medium border border-indigo-500/30 mb-2 backdrop-blur-md">
                 <Star className="w-3.5 h-3.5 mr-2 fill-current" /> The Ultimate Nepali Christian Lyrics Platform
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Praise & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Worship</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                  Connect with God through music. Discover the largest collection of Nepali Christian lyrics, hymns, and chords.
              </p>

              {/* Stats Section */}
              <div className="flex items-center justify-center gap-6 text-sm md:text-base text-slate-400 mt-4">
                  <div className="flex items-center bg-white/5 rounded-full px-4 py-1 border border-white/10">
                      <Database className="w-4 h-4 mr-2 text-indigo-400" />
                      <span className="font-bold text-white mr-1">{totalSongs}</span> Songs Added
                  </div>
              </div>

              {/* Integrated Search Bar */}
              <div className="max-w-2xl mx-auto mt-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                        type="text"
                        placeholder="Search for songs, artists, or lyrics..."
                        className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-4 pl-14 pr-6 text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-xl text-lg"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <Search className="absolute left-5 top-5 w-6 h-6 text-slate-400 group-focus-within:text-slate-500 transition-colors" />
                </form>
              </div>
          </div>
      </div>

      {/* Floating A-Z Navigation */}
      <div className="relative z-20 -mt-12 mb-8 max-w-7xl mx-auto px-4">
         <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-2 md:p-4 border border-slate-100">
             <AlphabetNav />
         </div>
      </div>

      {/* Slideshow Banners (Verses) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 lg:h-96 group">
            {banners.length > 0 && (
                <>
                    {/* Slides */}
                    {banners.map((banner, idx) => {
                        const Content = (
                             <>
                                <img src={banner.imageUrl} alt="Worship Background" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center text-center p-8">
                                    <p className="text-xl md:text-3xl lg:text-4xl font-serif text-white leading-relaxed max-w-4xl drop-shadow-lg italic">
                                        "{banner.title}"
                                    </p>
                                    {banner.subtitle && (
                                        <p className="mt-4 text-lg md:text-xl font-bold text-white/90 uppercase tracking-widest">
                                            — {banner.subtitle}
                                        </p>
                                    )}
                                </div>
                             </>
                        );

                        return (
                            <div 
                                key={banner.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
                            >
                                {banner.link ? (
                                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-pointer">
                                        {Content}
                                    </a>
                                ) : (
                                    <div className="w-full h-full relative">
                                        {Content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {/* Controls */}
                    <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentBannerIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Trending Songs (Left - Larger) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                   <Music className="w-5 h-5" />
                </div>
                Trending Now
             </h2>
             <Link to="/browse/songs/A" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
             </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            {data?.trendingSongs.map((song, idx) => (
              <Link 
                key={idx}
                to={`/lyrics/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
                className="relative flex items-center justify-between p-5 hover:bg-white transition-all group border-b border-slate-100 last:border-0"
              >
                 <div className="flex items-center gap-5 relative z-10">
                    {/* Stylized Rank Number */}
                    <span className={`text-2xl font-black w-8 text-center ${
                        idx === 0 ? 'text-yellow-500' : 
                        idx === 1 ? 'text-slate-400' : 
                        idx === 2 ? 'text-amber-600' : 'text-slate-200'
                    }`}>
                        {idx + 1}
                    </span>
                    
                    <div>
                       <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors line-clamp-1">{song.title}</h3>
                       <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600">{song.artist}</p>
                    </div>
                 </div>

                 <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                 </div>
                 
                 {/* Hover Highlight */}
                 <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Artists (Right - Smaller) */}
        <div className="lg:col-span-5 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                   <Mic2 className="w-5 h-5" />
                </div>
                Top Artists
              </h2>
              <Link to="/browse/artists/A" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {data?.popularArtists.map((artist, idx) => (
                 <Link 
                    key={idx}
                    to={`/artist/${encodeURIComponent(artist)}`}
                    className="flex items-center p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 transition-all group"
                 >
                    <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 mr-4 flex-shrink-0">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                             <img 
                                src={`https://picsum.photos/seed/${encodeURIComponent(artist)}/200`} 
                                alt={artist} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 text-base block truncate group-hover:text-purple-600 transition-colors">{artist}</span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Artist</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:text-purple-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                 </Link>
              ))}
           </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
