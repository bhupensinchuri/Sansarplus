import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites, FavoriteItem, toggleFavorite } from '../utils/storage';
import { getSongLyrics } from '../services/geminiService';
import { LyricsData } from '../types';
import { 
  Heart, Mic2, Disc, ArrowRight, Play, X, 
  Loader2, ZoomIn, ZoomOut, Maximize, 
  Minimize, PlayCircle, PauseCircle, ListOrdered, 
  SkipBack, SkipForward, Settings, Upload, RefreshCw, 
  Check, Trash2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const navigate = useNavigate();
  const { t, language: appLanguage } = useLanguage();
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [presentationQueue, setPresentationQueue] = useState<FavoriteItem[]>([]);
  
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  
  const [bgImage, setBgImage] = useState<string>('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop');
  const [bgBlur, setBgBlur] = useState(4);
  const [bgOpacity, setBgOpacity] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFavorites(getFavorites());
    const handleContentChange = () => setFavorites(getFavorites());
    window.addEventListener('content-change', handleContentChange);
    return () => window.removeEventListener('content-change', handleContentChange);
  }, []);

  const allFavoriteSongs = favorites.filter(f => f.type === 'song');
  const slidesToPresent = presentationQueue.length > 0 ? presentationQueue : allFavoriteSongs;

  const fetchSlideLyrics = async (index: number) => {
    setLoadingLyrics(true);
    setLyricsData(null);
    setIsAutoScrolling(false);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;

    const item = slidesToPresent[index];
    if (item) {
        const data = await getSongLyrics(item.subtext, item.name);
        setLyricsData(data);
    }
    setLoadingLyrics(false);
  };

  const startPresentation = () => {
    if (slidesToPresent.length === 0) return;
    setCurrentIndex(0);
    setIsPresenting(true);
    fetchSlideLyrics(0);
  };

  const nextSlide = useCallback(() => {
    if (currentIndex < slidesToPresent.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchSlideLyrics(newIndex);
    }
  }, [currentIndex, slidesToPresent.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      fetchSlideLyrics(newIndex);
    }
  }, [currentIndex]);

  const closePresentation = useCallback(() => {
    setIsPresenting(false);
    setLyricsData(null);
    setIsAutoScrolling(false);
    setShowSettings(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(e => console.error(e));
  }, []);

  const handleZoomIn = useCallback(() => setFontSize(prev => Math.min(prev + 4, 120)), []);
  const handleZoomOut = useCallback(() => setFontSize(prev => Math.max(prev - 4, 16)), []);

  // When font size changes, always reset scroll to top so lyrics start from first line
  useEffect(() => {
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
      }
  }, [fontSize]);

  const toggleBrowserFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsBrowserFullscreen(true)).catch(err => console.error(err));
    } else {
        document.exitFullscreen().then(() => setIsBrowserFullscreen(false));
    }
  }, []);

  const toggleAutoScroll = () => setIsAutoScrolling(!isAutoScrolling);
  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setPresentationQueue([]);
  };

  const handleSelectSong = (item: FavoriteItem) => {
      const existsIdx = presentationQueue.findIndex(i => i.id === item.id);
      if (existsIdx >= 0) {
          const newQueue = [...presentationQueue];
          newQueue.splice(existsIdx, 1);
          setPresentationQueue(newQueue);
      } else {
          setPresentationQueue([...presentationQueue, item]);
      }
  };

  const handleRemoveFavorite = (e: React.MouseEvent, item: FavoriteItem) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm(`${t('Remove')} "${item.name}" ${t('from favorites')}?`)) {
          toggleFavorite(item);
          window.dispatchEvent(new Event('content-change'));
      }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setBgImage(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const resetSettings = () => {
      setBgImage('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop');
      setBgBlur(4);
      setBgOpacity(50);
  };

  useEffect(() => {
      const handleFsChange = () => setIsBrowserFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isAutoScrolling && scrollContainerRef.current) {
          interval = setInterval(() => {
              if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTop += 1;
                  if (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.scrollTop === scrollContainerRef.current.clientHeight) {
                      setIsAutoScrolling(false);
                  }
              }
          }, 40);
      }
      return () => clearInterval(interval);
  }, [isAutoScrolling]);

  useEffect(() => {
    if (!isPresenting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'Escape') {
        if (!document.fullscreenElement) closePresentation();
      }
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-' || e.key === '_') handleZoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, nextSlide, prevSlide, closePresentation, handleZoomIn, handleZoomOut]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('Favorites')}</h1>
            <p className="text-slate-500 font-medium">
              {favorites.length} {t('Items saved')}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            <button 
              onClick={toggleSelectionMode}
              disabled={favorites.length === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${isSelectionMode ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              {isSelectionMode ? <X className="w-4 h-4" /> : <ListOrdered className="w-4 h-4" />}
              {isSelectionMode ? t('Cancel Selection') : t('Select Order')}
            </button>
            
            <button 
              disabled={slidesToPresent.length === 0}
              onClick={startPresentation}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
            >
              <Play className="w-4 h-4 fill-current" />
              {t('Present')}
            </button>
          </div>
        </div>

        {isSelectionMode && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 text-sm font-bold animate-in slide-in-from-top-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><Check className="w-5 h-5" /></div>
            {t('Click songs to add them to your presentation queue.')} ({presentationQueue.length} {t('selected')})
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Heart className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{t('No favorites yet')}</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">{t('Start browsing songs and artists to add them to your collection.')}</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              {t('Browse Music')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((item, idx) => {
              const isSong = item.type === 'song';
              const isSelected = presentationQueue.some(i => i.id === item.id);
              
              const linkPath = isSong 
                ? (item.dbId ? `/l/${item.dbId}` : `/lyrics/${encodeURIComponent(item.subtext)}/${encodeURIComponent(item.name)}`)
                : `/artist/${encodeURIComponent(item.name)}`;

              // Use Nepali title if app language is Nepali and name_nepali exists
              const displayTitle = (appLanguage === 'nepali' && item.name_nepali) ? item.name_nepali : item.name;
              
              // Hide artist subtext if it's "Unknown"
              const isArtistUnknown = item.subtext.toLowerCase() === 'unknown';

              return (
                <div 
                  key={item.id}
                  onClick={() => isSelectionMode && isSong ? handleSelectSong(item) : null}
                  className={`group relative flex items-center p-4 md:p-6 bg-white rounded-[2rem] border transition-all ${isSelectionMode && isSong ? 'cursor-pointer active:scale-[0.98]' : ''} ${isSelected ? 'border-primary ring-4 ring-primary/10 bg-primary/5' : 'border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-md'}`}
                >
                  {isSelectionMode && isSong && (
                    <div className={`mr-5 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-slate-200 bg-slate-50 text-transparent'}`}>
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                  
                  {!isSelectionMode && (
                    <div className="mr-5 w-10 text-center font-black text-slate-200 text-xl group-hover:text-primary transition-colors">
                        {idx + 1}
                    </div>
                  )}

                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mr-5 shrink-0 shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {isSong ? <Disc className="w-7 h-7" /> : <Mic2 className="w-7 h-7" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {displayTitle}
                      {item.note && <span className="ml-2 text-[10px] md:text-xs text-slate-400 font-normal italic">({item.note})</span>}
                    </h3>
                    {!isArtistUnknown && (
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{item.subtext}</p>
                    )}
                  </div>

                  {!isSelectionMode && (
                    <div className="flex items-center gap-2">
                       <Link 
                        to={linkPath}
                        className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                       >
                        <ArrowRight className="w-6 h-6" />
                       </Link>
                       <button 
                        onClick={(e) => handleRemoveFavorite(e, item)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       >
                        <Trash2 className="w-6 h-6" />
                       </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Presentation Overlay */}
      {isPresenting && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center text-white overflow-hidden animate-in fade-in duration-300">
           {/* Background Layer */}
           <div className="absolute inset-0 z-0">
              <img src={bgImage} alt="" className="w-full h-full object-cover" style={{ filter: `blur(${bgBlur}px)`, opacity: bgOpacity / 100 }} />
           </div>

           {/* Toolbar */}
           <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <button onClick={closePresentation} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all">
                  <X className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                  <h2 className="font-black text-xl tracking-tight">{slidesToPresent[currentIndex].name}</h2>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">{currentIndex + 1} / {slidesToPresent.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handleZoomOut} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"><ZoomOut className="w-5 h-5"/></button>
                <button onClick={handleZoomIn} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"><ZoomIn className="w-5 h-5"/></button>
                <div className="w-px h-8 bg-white/20 mx-2"></div>
                <button onClick={toggleAutoScroll} className={`p-3 rounded-full transition-all ${isAutoScrolling ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/10 hover:bg-white/20'}`}>
                  {isAutoScrolling ? <PauseCircle className="w-6 h-6"/> : <PlayCircle className="w-6 h-6"/>}
                </button>
                <button onClick={toggleBrowserFullscreen} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                  {isBrowserFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
                </button>
                <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
           </div>

           {/* Settings Panel */}
           {showSettings && (
             <div className="absolute top-24 right-6 z-30 bg-slate-950/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] w-80 shadow-2xl animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-sm uppercase tracking-widest text-white/40">Visual Settings</h3>
                  <button onClick={resetSettings} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5"/> Reset</button>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Background Mood</label>
                    <div className="flex gap-2">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl text-[10px] p-3 outline-none text-white/60 font-mono" value={bgImage} onChange={e => setBgImage(e.target.value)} placeholder="Image URL..." />
                      <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"><Upload className="w-4 h-4"/></button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
                    </div>
                  </div>
                  <div>
                    <label className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Blur Intensity <span>{bgBlur}px</span></label>
                    <input type="range" min="0" max="20" value={bgBlur} onChange={e => setBgBlur(parseInt(e.target.value))} className="w-full accent-primary bg-white/10 rounded-lg h-1 appearance-none" />
                  </div>
                  <div>
                    <label className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Atmosphere Dimmer <span>{bgOpacity}%</span></label>
                    <input type="range" min="0" max="100" value={bgOpacity} onChange={e => setBgOpacity(parseInt(e.target.value))} className="w-full accent-primary bg-white/10 rounded-lg h-1 appearance-none" />
                  </div>
                </div>
             </div>
           )}

           {/* Content Area */}
           <div 
             ref={scrollContainerRef}
             className="relative z-10 w-full h-full flex flex-col items-center p-8 md:p-24 overflow-y-auto lyrics-scroll"
           >
              {loadingLyrics ? (
                <div className="text-center space-y-6 my-auto">
                  <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto opacity-40" />
                  <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Fetching Worship Data...</p>
                </div>
              ) : lyricsData ? (
                <div className="max-w-5xl w-full text-center whitespace-pre-wrap leading-relaxed transition-all duration-700 animate-in slide-in-from-bottom-12" style={{ fontSize: `${fontSize}px` }}>
                  <div className="mb-16 print:hidden">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Song Intro</h4>
                    <div className="w-20 h-1 bg-primary/30 mx-auto rounded-full"></div>
                  </div>
                  <div className="font-medium text-white drop-shadow-xl selection:bg-primary/40">
                    {lyricsData.lyrics_nepali || lyricsData.lyrics_roman || lyricsData.lyrics || "No lyrics content available."}
                  </div>
                  <div className="mt-20 opacity-10 font-black tracking-tighter text-4xl">SANSARPLUS</div>
                </div>
              ) : (
                <div className="text-center space-y-4 my-auto">
                  <Disc className="w-20 h-20 text-white/5 mx-auto animate-spin-slow" />
                  <p className="text-white/20 font-bold uppercase tracking-widest italic">Awaiting Lyrics Loading...</p>
                </div>
              )}
           </div>

           {/* Navigation Controls */}
           <div className="absolute bottom-0 left-0 right-0 z-20 p-8 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-3">
                <button onClick={prevSlide} disabled={currentIndex === 0} className="p-5 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] backdrop-blur-md transition-all disabled:opacity-5 disabled:scale-95 transform active:scale-90 shadow-xl border border-white/5">
                  <SkipBack className="w-8 h-8" />
                </button>
                <button onClick={nextSlide} disabled={currentIndex === slidesToPresent.length - 1} className="p-5 bg-primary hover:bg-primary/90 text-white rounded-[2rem] backdrop-blur-md transition-all disabled:opacity-5 disabled:scale-95 transform active:scale-90 shadow-xl shadow-primary/20 border border-primary/20">
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>
              <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] hidden sm:block">
                PRESENTATION ENGINE v1.2
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;