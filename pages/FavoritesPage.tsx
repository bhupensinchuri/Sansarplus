import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites, FavoriteItem } from '../utils/storage';
import { getSongLyrics } from '../services/geminiService';
import { LyricsData } from '../types';
import { Heart, Mic2, Disc, ArrowRight, Play, X, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, Maximize, Minimize, PlayCircle, PauseCircle, ListOrdered, Circle, SkipBack, SkipForward } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const navigate = useNavigate();
  
  // Selection / Ordering State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [presentationQueue, setPresentationQueue] = useState<FavoriteItem[]>([]);
  
  // Presentation State
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [fontSize, setFontSize] = useState(32); // Default presentation font size
  
  // New Features State
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Filter only songs for presentation
  const allFavoriteSongs = favorites.filter(f => f.type === 'song');
  
  // The actual list to present: either the custom queue or all favorites
  const slidesToPresent = presentationQueue.length > 0 ? presentationQueue : allFavoriteSongs;

  const fetchSlideLyrics = async (index: number) => {
    setLoadingLyrics(true);
    setLyricsData(null); // Clear previous lyrics while loading
    
    // Reset Scroll and AutoScroll
    setIsAutoScrolling(false);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }

    const item = slidesToPresent[index];
    if (item) {
        // item.subtext is Artist, item.name is Title
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
    // Exit native fullscreen if active
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.error(e));
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setFontSize(prev => Math.min(prev + 4, 96));
  }, []);

  const handleZoomOut = useCallback(() => {
    setFontSize(prev => Math.max(prev - 4, 16));
  }, []);

  const toggleBrowserFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            setIsBrowserFullscreen(true);
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err}`);
        });
    } else {
        document.exitFullscreen().then(() => {
            setIsBrowserFullscreen(false);
        });
    }
  }, []);

  const toggleAutoScroll = () => {
      setIsAutoScrolling(!isAutoScrolling);
  };

  // Selection Logic
  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setPresentationQueue([]); // Reset queue when toggling
  };

  const handleSelectSong = (item: FavoriteItem) => {
      const existsIdx = presentationQueue.findIndex(i => i.id === item.id);
      if (existsIdx >= 0) {
          // Remove
          const newQueue = [...presentationQueue];
          newQueue.splice(existsIdx, 1);
          setPresentationQueue(newQueue);
      } else {
          // Add to end
          setPresentationQueue([...presentationQueue, item]);
      }
  };

  // Handle Fullscreen change events
  useEffect(() => {
      const handleFsChange = () => {
          setIsBrowserFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto Scroll Effect
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isAutoScrolling && scrollContainerRef.current) {
          interval = setInterval(() => {
              if (scrollContainerRef.current) {
                  // Scroll down by 1px every 50ms
                  scrollContainerRef.current.scrollTop += 1;
                  
                  // Stop if reached bottom
                  if (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.scrollTop === scrollContainerRef.current.clientHeight) {
                      setIsAutoScrolling(false);
                  }
              }
          }, 40);
      }
      return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
            closePresentation();
        }
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === 'f') {
        toggleBrowserFullscreen();
      } else if (e.key === ' ') {
        e.preventDefault(); // Prevent accidental page scroll
        toggleAutoScroll(); // Space to toggle scroll
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, nextSlide, prevSlide, closePresentation, handleZoomIn, handleZoomOut, toggleBrowserFullscreen, isAutoScrolling]);

  // --- Presentation View ---
  if (isPresenting) {
    const currentItem = slidesToPresent[currentIndex];
    
    // Generate a consistent "worship" style background based on song name
    const bgUrl = `https://picsum.photos/seed/${encodeURIComponent(currentItem.name + 'worship')}/1920/1080?blur=1`;

    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden">
        {/* Automatic Worship Wallpaper */}
        <div className="absolute inset-0 z-0">
           <img 
             src={bgUrl} 
             alt="Worship Background" 
             className="w-full h-full object-cover transition-opacity duration-1000"
           />
           {/* Heavy overlay for clear lyrics */}
           <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-md z-20 absolute top-0 left-0 right-0 transition-opacity hover:opacity-100 opacity-0 md:opacity-100 border-b border-white/10">
           <div className="text-sm font-medium text-white/80">
              {currentIndex + 1} / {slidesToPresent.length}
           </div>
           
           <div className="flex items-center space-x-2 md:space-x-3">
               
               {/* Nav Controls */}
               <button 
                  onClick={prevSlide} 
                  disabled={currentIndex === 0}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30" 
                  title="Previous Song"
               >
                   <SkipBack className="w-5 h-5" />
               </button>
               <button 
                  onClick={nextSlide} 
                  disabled={currentIndex === slidesToPresent.length - 1}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30" 
                  title="Next Song"
               >
                   <SkipForward className="w-5 h-5" />
               </button>

               <div className="w-px h-6 bg-white/20 mx-1"></div>

               {/* Scroll Toggle */}
               <button onClick={toggleAutoScroll} className={`p-2 rounded-full transition-colors ${isAutoScrolling ? 'bg-primary text-white' : 'hover:bg-white/20'}`} title="Auto Scroll (Space)">
                   {isAutoScrolling ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
               </button>

               <div className="w-px h-6 bg-white/20 mx-1"></div>

               {/* Font Size */}
               <button onClick={handleZoomOut} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Zoom Out (-)">
                   <ZoomOut className="w-5 h-5" />
               </button>
               <button onClick={handleZoomIn} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Zoom In (+)">
                   <ZoomIn className="w-5 h-5" />
               </button>
               
               <div className="w-px h-6 bg-white/20 mx-1"></div>

               {/* Fullscreen Toggle */}
               <button onClick={toggleBrowserFullscreen} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Toggle Fullscreen (F)">
                   {isBrowserFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
               </button>
               
               <button onClick={closePresentation} className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-400 hover:text-red-300" title="Close Presentation (Esc)">
                   <X className="w-5 h-5" />
               </button>
           </div>
        </div>

        {/* Click Zones for Navigation (Hidden but clickable) */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-24 z-10 hover:bg-white/5 cursor-pointer flex items-center justify-start group" onClick={prevSlide}>
             <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 text-white/20 group-hover:text-white/50 transition-colors ml-2 md:ml-4 drop-shadow-lg" />
        </div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-24 z-10 hover:bg-white/5 cursor-pointer flex items-center justify-end group" onClick={nextSlide}>
             <ChevronRight className="w-8 h-8 md:w-12 md:h-12 text-white/20 group-hover:text-white/50 transition-colors mr-2 md:mr-4 drop-shadow-lg" />
        </div>

        {/* Content Area */}
        <div 
            ref={scrollContainerRef}
            className="flex-1 flex flex-col items-center justify-start p-12 md:p-24 overflow-y-auto no-scrollbar w-full scroll-smooth z-10 relative"
        >
            <div className="w-full max-w-7xl mx-auto py-12">
                <div className="text-center mb-12">
                   <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{currentItem.name}</h1>
                   <p className="text-xl md:text-2xl text-white/80 drop-shadow-md">{currentItem.subtext}</p>
                </div>

                {loadingLyrics ? (
                   <div className="flex justify-center py-20">
                      <Loader2 className="w-16 h-16 animate-spin text-white/80" />
                   </div>
                ) : lyricsData ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full pb-24">
                       {/* Nepali Column */}
                       <div className="text-center md:text-right border-r border-white/20 pr-4 md:pr-8">
                           <h3 className="text-sm uppercase tracking-[0.2em] text-white/60 mb-8 font-bold">Nepali</h3>
                           <div 
                              className="whitespace-pre-wrap leading-relaxed font-sans font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                              style={{ fontSize: `${fontSize}px` }}
                           >
                               {lyricsData.lyrics_nepali || "Nepali lyrics not available"}
                           </div>
                       </div>
                       
                       {/* Roman Column */}
                       <div className="text-center md:text-left pl-4 md:pl-8">
                           <h3 className="text-sm uppercase tracking-[0.2em] text-white/60 mb-8 font-bold">Romanized</h3>
                            <div 
                              className="whitespace-pre-wrap leading-relaxed font-sans text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                              style={{ fontSize: `${fontSize}px` }}
                           >
                               {lyricsData.lyrics_roman || "Romanized lyrics not available"}
                           </div>
                       </div>
                   </div>
                ) : (
                   <p className="text-center text-white/50 text-xl">Could not load lyrics for this song.</p>
                )}
            </div>
        </div>
      </div>
    );
  }

  // --- Normal View ---
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Favorites</h1>
        
        {allFavoriteSongs.length > 0 && (
           <div className="flex items-center space-x-2 w-full md:w-auto">
               <button 
                 onClick={toggleSelectionMode}
                 className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 rounded-full transition-all ${
                     isSelectionMode 
                     ? 'bg-slate-200 text-slate-700 font-medium' 
                     : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                 }`}
               >
                  {isSelectionMode ? <X className="w-5 h-5 mr-2" /> : <ListOrdered className="w-5 h-5 mr-2" />}
                  {isSelectionMode ? 'Cancel Selection' : 'Select Order'}
               </button>

               <button 
                 onClick={startPresentation}
                 className="flex-1 md:flex-none flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 font-medium"
               >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  {isSelectionMode && presentationQueue.length > 0 
                     ? `Play (${presentationQueue.length})` 
                     : 'Play All'}
               </button>
           </div>
        )}
      </div>

      {isSelectionMode && (
          <div className="mb-6 bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-center">
              <ListOrdered className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                  <p className="font-bold text-sm">Custom Presentation Mode</p>
                  <p className="text-xs mt-1 opacity-80">Click songs to add them to your presentation queue. The numbers indicate the slide order.</p>
              </div>
          </div>
      )}
      
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No favorites yet</h3>
          <p className="text-slate-500 mb-6">Start browsing songs and artists to add them to your collection.</p>
          <Link to="/" className="inline-flex items-center text-primary font-bold hover:underline">
            Browse Music <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item) => {
            // Check if selected for queue
            const queueIndex = presentationQueue.findIndex(q => q.id === item.id);
            const isSelected = queueIndex >= 0;

            const CardContent = (
               <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4 transition-colors ${item.type === 'artist' ? 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                    {item.type === 'artist' ? <Mic2 className="w-6 h-6" /> : <Disc className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        {item.type === 'artist' ? <Mic2 className="w-3 h-3 text-secondary" /> : <Disc className="w-3 h-3 text-primary" />}
                        <span className="text-[10px] font-bold uppercase text-slate-400">{item.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{item.name}</h3>
                    <p className="text-slate-500 text-sm truncate">{item.subtext}</p>
                </div>

                {isSelectionMode && item.type === 'song' && (
                    <div className="ml-3">
                        {isSelected ? (
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md transform scale-110 transition-transform">
                                {queueIndex + 1}
                            </div>
                        ) : (
                            <Circle className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                )}
               </>
            );

            // In selection mode, we use a div with onClick handler
            if (isSelectionMode && item.type === 'song') {
                return (
                    <div
                        key={item.id}
                        onClick={() => handleSelectSong(item)}
                        className={`flex items-center p-4 bg-white rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${isSelected ? 'border-primary ring-1 ring-primary/50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        {CardContent}
                    </div>
                );
            }

            // Normal mode
            return (
                <Link
                key={item.id}
                to={item.type === 'artist' 
                    ? `/artist/${encodeURIComponent(item.name)}` 
                    : `/lyrics/${encodeURIComponent(item.subtext)}/${encodeURIComponent(item.name)}`
                }
                className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md"
                >
                {CardContent}
                </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;