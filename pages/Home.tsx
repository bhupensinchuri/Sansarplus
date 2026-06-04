import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Music, Disc, Mic2, ArrowRight, Play, Star, ChevronLeft, Database } from 'lucide-react';
import { getTrendingContent } from '../services/geminiService';
import Loader from '../components/Loader';
import AlphabetNav from '../components/AlphabetNav';
import { HomeData, Banner, Announcement, Category } from '../types';
import { getBanners, getAllCustomSongs, getAnnouncement, getCategories } from '../utils/dataManager';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trendingResult, bannersResult, songsResult, announcementResult, categoriesResult] = await Promise.all([
        getTrendingContent(),
        getBanners(),
        getAllCustomSongs(),
        getAnnouncement(),
        getCategories()
      ]);

      setData(trendingResult);
      setBanners(bannersResult);
      setTotalSongs(songsResult.length);
      setAnnouncement(announcementResult);
      setCategories(categoriesResult);
    } catch (err) {
      console.error("Home page data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleContentChange = () => fetchData();
    window.addEventListener('content-change', handleContentChange);
    return () => window.removeEventListener('content-change', handleContentChange);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const nextBanner = () => setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput)}`);
    }
  };

  const getSongColorClass = (lang?: string) => {
      if (lang === 'hindi') return 'text-red-600';
      if (lang === 'english') return 'text-blue-600';
      return 'text-slate-800';
  };

  const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600', 'text-blue-500', 'text-emerald-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-orange-500'];
  const rankBgColors = [
    'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white',
    'bg-slate-100 text-slate-600 group-hover:bg-slate-500 group-hover:text-white',
    'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white',
    'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
    'bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white',
    'bg-pink-50 text-pink-600 group-hover:bg-pink-500 group-hover:text-white',
    'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white',
    'bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white',
    'bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white'
  ];

  if (loading) return <Loader fullScreen text="Loading content..." />;

  // Prepare special categories grid
  const specialNames = ['Bhajan', 'Chorus', 'Praise', 'Worship'];
  const specialCats = specialNames.map(name => {
      const found = (categories || []).find(c => c.name.toLowerCase() === name.toLowerCase());
      return found || { name, imageUrl: '', hideTitle: false };
  });

  const getFallbackGradient = (name: string) => {
    switch(name.toLowerCase()) {
        case 'bhajan': return 'from-orange-500 to-red-600';
        case 'chorus': return 'from-blue-500 to-indigo-600';
        case 'praise': return 'from-emerald-500 to-teal-600';
        case 'worship': return 'from-violet-500 to-purple-700';
        default: return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-60"></div>
         <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 bg-slate-900 text-white pt-8 md:pt-12 pb-24 md:pb-32 px-4 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4 md:space-y-6">
              
              <div className="inline-flex items-center justify-center px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 text-xs md:text-sm font-medium border border-indigo-500/30 mb-2 backdrop-blur-md">
                 <Star className="w-3 h-3 md:w-3.5 md:h-3.5 mr-2 fill-current" /> Largest Nepali Christian Lyrics Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">Praise & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Worship</span></h1>
              <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed px-2">Connect with God through music. Discover the largest collection of Nepali Christian lyrics, hymns, and chords.</p>
              <div className="flex items-center justify-center gap-6 text-sm md:text-base text-slate-400 mt-4">
                  <div className="flex items-center bg-white/5 rounded-full px-4 py-1 border border-white/10">
                      <Database className="w-4 h-4 mr-2 text-indigo-400" /><span className="font-bold text-white mr-1">{totalSongs}</span> {t('Songs')} Added
                  </div>
              </div>
              <div className="max-w-2xl mx-auto mt-6 md:mt-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <form onSubmit={handleSearchSubmit} className="relative">
                    <input type="text" placeholder={`${t('Search')}...`} className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-3 md:py-4 pl-12 md:pl-14 pr-6 text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-xl text-base md:text-lg" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    <Search className="absolute left-4 md:left-5 top-3.5 md:top-5 w-5 h-5 md:w-6 md:h-6 text-slate-400 group-focus-within:text-slate-500 transition-colors" />
                </form>
              </div>
          </div>
      </div>

      {announcement && announcement.isVisible && announcement.imageUrl && (
        <div className="relative z-20 -mt-16 mb-4 max-w-7xl mx-auto px-4">
             {announcement.link ? (
                 <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-white/20">
                     <img src={announcement.imageUrl} alt="Announcement" className="w-full h-auto object-cover max-h-[300px]" />
                 </a>
             ) : (
                 <div className="w-full overflow-hidden rounded-2xl shadow-xl border border-white/20">
                     <img src={announcement.imageUrl} alt="Announcement" className="w-full h-auto object-cover max-h-[300px]" />
                 </div>
             )}
        </div>
      )}

      <div className={`relative z-20 ${announcement?.isVisible ? 'mt-4' : '-mt-12'} mb-8 max-w-7xl mx-auto px-4`}>
         <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-2 md:p-4 border border-slate-100">
             <AlphabetNav />
         </div>
      </div>

      {/* Featured Category Banner Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specialCats.map((cat) => (
                  <Link 
                    key={cat.name} 
                    to={`/category/${encodeURIComponent(cat.name)}`}
                    className="relative group rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[4/3] shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                      {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getFallbackGradient(cat.name)} flex items-center justify-center`}>
                              <Music className="w-10 h-10 text-white/30" />
                          </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors opacity-100"></div>
                      
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
      </div>

      {/* Verses Slideshow Banner */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-48 sm:h-64 md:h-80 lg:h-96 group">
            {banners.length > 0 && (
                <>
                    {banners.map((banner, idx) => {
                        const hasContent = banner.title || banner.subtitle;
                        const Content = (
                             <>
                                <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                                {hasContent && (
                                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center text-center p-6 md:p-8">
                                        {banner.title && <p className="text-lg md:text-3xl lg:text-4xl font-serif text-white leading-relaxed max-w-4xl drop-shadow-lg italic line-clamp-4 md:line-clamp-none">"{banner.title}"</p>}
                                        {banner.subtitle && <p className="mt-2 md:mt-4 text-sm md:text-xl font-bold text-white/90 uppercase tracking-widest">— {banner.subtitle}</p>}
                                    </div>
                                )}
                             </>
                        );
                        return (
                            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}>
                                {banner.link ? <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-pointer">{Content}</a> : <div className="w-full h-full relative">{Content}</div>}
                            </div>
                        );
                    })}
                    <button onClick={prevBanner} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /></button>
                    <button onClick={nextBanner} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><ChevronRight className="w-5 h-5 md:w-6 md:h-6" /></button>
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, idx) => <button key={idx} onClick={() => setCurrentBannerIndex(idx)} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-4 md:w-6' : 'bg-white/50 hover:bg-white/80'}`} />)}
                    </div>
                </>
            )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3"><Music className="w-5 h-5" /></div>{t('Trending Now')}
             </h2>
             <Link to="/browse/songs/A" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center">{t('View All')} <ChevronRight className="w-4 h-4 ml-1" /></Link>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            {data?.trendingSongs.length === 0 ? <p className="p-8 text-center text-slate-400 italic">No trending songs yet.</p> : data?.trendingSongs.map((song: any, idx) => {
                const displayTitle = (language === 'nepali' && song.title_nepali) ? song.title_nepali : song.title;
                return (
                <Link key={idx} to={`/l/${song.id}`} className="relative flex items-center justify-between p-4 md:p-5 hover:bg-white transition-all group border-b border-slate-100 last:border-0">
                   <div className="flex items-center gap-4 md:gap-5 relative z-10">
                      <span className={`text-xl md:text-2xl font-black w-6 md:w-8 text-center ${rankColors[idx] || 'text-slate-200'}`}>{idx + 1}</span>
                      <div>
                         <h3 className={`font-bold text-base md:text-lg transition-colors line-clamp-1 ${getSongColorClass(song.language)}`}>
                            {displayTitle}
                            {song.note && <span className="ml-1.5 text-xs text-slate-400 font-medium italic">({song.note})</span>}
                         </h3>
                         {song.artist && song.artist.trim().toLowerCase() !== 'unknown' && (
                           <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600 line-clamp-1">{song.artist}</p>
                         )}
                      </div>
                   </div>
                   <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all transform group-hover:scale-110 shadow-sm flex-shrink-0 ${rankBgColors[idx] || 'bg-slate-50 text-slate-300'}`}><Play className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5 fill-current" /></div>
                </Link>
            )})}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3"><Mic2 className="w-5 h-5" /></div>{t('Top Artists')}
              </h2>
              <Link to="/browse/artists/A" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center">{t('View All')} <ChevronRight className="w-4 h-4 ml-1" /></Link>
           </div>
           <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              {data?.popularArtists.length === 0 ? <p className="p-8 text-center text-slate-400 italic">No popular artists yet.</p> : data?.popularArtists.map((artist, idx) => (
                   <Link key={idx} to={`/artist/${encodeURIComponent(artist.name)}`} className="relative flex items-center justify-between p-4 hover:bg-white transition-all group border-b border-slate-100 last:border-0">
                       <div className="flex items-center gap-4 relative z-10 min-w-0">
                          <span className={`text-lg md:text-xl font-black w-6 text-center flex-shrink-0 ${rankColors[idx] || 'text-purple-200'}`}>{idx + 1}</span>
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                {artist.imageUrl ? <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Mic2 className="w-6 h-6" /></div>}
                          </div>
                          <div className="min-w-0">
                              <span className="font-bold text-slate-800 text-base block truncate group-hover:text-purple-600 transition-colors">{artist.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">ARTIST</span>
                          </div>
                       </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors flex-shrink-0"><ChevronRight className="w-4 h-4" /></div>
                   </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;