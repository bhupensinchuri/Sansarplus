
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSongLyrics, getArtistDetails } from '../services/geminiService';
import { LyricsData, ArtistDetails } from '../types';
import Loader from '../components/Loader';
import { User, Heart, Music, PenTool, Copy, Check, ArrowRight, ZoomIn, ZoomOut, Flag, X, Edit, Trash2, Save, Printer, Tag } from 'lucide-react';
import { isFavorite, toggleFavorite, generateId } from '../utils/storage';
import { useAuth } from '../utils/auth';
import { saveCustomSong, deleteCustomSong, incrementViewCount, setViewCount, saveCustomArtist, getCategories } from '../utils/dataManager';

const LyricsPage: React.FC = () => {
  const { artist, song } = useParams<{ artist: string; song: string }>();
  const [data, setData] = useState<LyricsData | null>(null);
  const [artistData, setArtistData] = useState<ArtistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState<'nepali' | 'roman'>('nepali');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(20); // Default font size
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Auth & Editing
  const isAuth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  // Extended edit form
  const [editForm, setEditForm] = useState<LyricsData & { artist_bio?: string }>({
      lyrics_nepali: '',
      lyrics_roman: '',
      composer: '',
      lyricist: '',
      views: 0,
      artist_bio: '',
      category: '',
      categories: []
  });
  
  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('lyrics');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (artist && song) {
        setLoading(true);
        setAvailableCategories(getCategories());
        
        // Parallel Fetch
        const [lyricsResult, artistResult] = await Promise.all([
            getSongLyrics(artist, song),
            getArtistDetails(artist)
        ]);

        setData(lyricsResult);
        setArtistData(artistResult);

        if (lyricsResult) {
            // Handle legacy category vs new categories array
            let initialCats = lyricsResult.categories || [];
            if (initialCats.length === 0 && lyricsResult.category) {
                initialCats = [lyricsResult.category];
            }

            setEditForm({ 
                ...lyricsResult, 
                views: lyricsResult.views || 0,
                artist_bio: artistResult?.bio || '',
                category: lyricsResult.category || 'Worship',
                categories: initialCats
            });
        }
        
        setIsFav(isFavorite(generateId('song', song, artist)));
        setLoading(false);
        
        // Keep tracking views in background, but don't display
        incrementViewCount(artist, song);
      }
    };
    fetchData();
  }, [artist, song]);

  const handleFavorite = () => {
    if (!data || !artist || !song) return;
    const item = {
        id: generateId('song', song, artist),
        type: 'song' as const,
        name: song,
        subtext: artist
    };
    const added = toggleFavorite(item);
    setIsFav(added);
  };

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = activeTab === 'nepali' 
        ? (data.lyrics_nepali || data.lyrics || "") 
        : (data.lyrics_roman || "");
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 4, 64));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 16));
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
        setFeedbackSubmitted(true);
        setTimeout(() => {
            setFeedbackSubmitted(false);
            setIsFeedbackOpen(false);
            setFeedbackText('');
            setFeedbackType('lyrics');
        }, 2000);
    }, 500);
  };

  // --- Admin Functions ---
  const handleSaveEdit = () => {
      if (!artist || !song) return;
      
      const { artist_bio, ...songData } = editForm;
      saveCustomSong(artist, song, songData);
      
      // Still allow saving views if they were edited via form state, even if hidden
      if (editForm.views !== undefined) {
         setViewCount(artist, song, editForm.views);
      }

      if (artist_bio && artist_bio !== artistData?.bio) {
          const updatedArtist: ArtistDetails = {
              name: artist,
              bio: artist_bio,
              topSongs: artistData?.topSongs || []
          };
          saveCustomArtist(artist, updatedArtist);
          setArtistData(updatedArtist);
      }

      setData(songData);
      setIsEditing(false);
  };

  const toggleCategorySelection = (cat: string) => {
      setEditForm(prev => {
          const cats = prev.categories || [];
          if (cats.includes(cat)) {
              return { ...prev, categories: cats.filter(c => c !== cat) };
          } else {
              return { ...prev, categories: [...cats, cat] };
          }
      });
  };

  const handleDeleteSong = () => {
      if (!artist || !song) return;
      if (window.confirm("Are you sure you want to delete this lyrics page?")) {
          deleteCustomSong(artist, song);
          navigate('/');
      }
  };

  const currentUrl = window.location.href;
  const shareTitle = `Check out "${song}" by ${artist} on SansarPlus`;
  
  const socialLinks = [
    {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`,
        color: 'hover:bg-[#25D366] hover:text-white text-[#25D366] bg-[#25D366]/10',
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    },
    {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        color: 'hover:bg-[#1877F2] hover:text-white text-[#1877F2] bg-[#1877F2]/10',
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.411h3.085l-.005 3.633-3.08 3.667v7.98h-4.843Z"/></svg>
    },
    {
        name: 'X',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`,
        color: 'hover:bg-black hover:text-white text-black bg-gray-100',
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
  ];

  if (loading) return <Loader fullScreen text="Loading lyrics..." />;
  if (!data || !artist || !song) return <div className="text-slate-500 text-center pt-20">Lyrics not found.</div>;

  // Determine categories to show
  const displayCategories = data.categories && data.categories.length > 0 
      ? data.categories 
      : (data.category ? [data.category] : []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* 1. Immersive Hero Header */}
      <div className="relative bg-slate-900 text-white pb-24 pt-24 md:pt-32 px-4 overflow-hidden shadow-lg no-print">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black z-0"></div>
         {/* Decorative Abstract blobs */}
         <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]"></div>

         <div className="relative z-10 max-w-4xl mx-auto text-center">
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-2xl">
                {song}
            </h1>
            
            <Link 
                to={`/artist/${encodeURIComponent(artist)}`} 
                className="inline-flex items-center text-xl md:text-2xl text-slate-300 hover:text-white transition-colors font-medium border-b border-transparent hover:border-white/50 pb-1"
            >
                <User className="w-5 h-5 mr-2" /> {artist}
            </Link>
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-20 space-y-8">
         
         {/* Admin Panel */}
         {isAuth && (
            <div className="bg-white rounded-xl shadow-lg p-2 mb-4 flex justify-between items-center no-print">
               <span className="text-xs font-bold text-slate-400 px-3 uppercase">Admin Controls</span>
               <div className="flex gap-2">
                  {isEditing ? (
                      <>
                        <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"><Save className="w-5 h-5" /></button>
                        <button onClick={() => setIsEditing(false)} className="bg-slate-500 text-white p-2 rounded-lg hover:bg-slate-600"><X className="w-5 h-5" /></button>
                      </>
                  ) : (
                      <>
                        <button onClick={() => setIsEditing(true)} className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90"><Edit className="w-5 h-5" /></button>
                        <button onClick={handleDeleteSong} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Trash2 className="w-5 h-5" /></button>
                      </>
                  )}
               </div>
            </div>
         )}

         {isEditing && (
             <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm animate-in slide-in-from-top-4">
                <h3 className="font-bold text-yellow-800 mb-4 border-b border-yellow-200 pb-2">Edit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Categories</label>
                        <div className="bg-white border rounded p-2 max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {availableCategories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => toggleCategorySelection(cat)}
                                    className={`text-xs px-2 py-1 rounded text-left ${
                                        (editForm.categories || []).includes(cat)
                                        ? 'bg-primary text-white font-bold'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {cat}
                                </button>
                             ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Selected: {(editForm.categories || []).join(', ')}</p>
                    </div>
                </div>
             </div>
         )}

         {/* 2. Main Lyrics Card (Glassmorphism Effect) */}
         <div className="bg-white/90 backdrop-blur-xl p-6 md:p-12 rounded-3xl shadow-2xl border border-white/50 print:border-none print:shadow-none print:p-0">
             
             {/* Toolbar */}
             {!isEditing && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-100 pb-6 no-print">
                    <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner">
                        <button
                            onClick={() => setActiveTab('nepali')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'nepali' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                        Nepali
                        </button>
                        <button
                            onClick={() => setActiveTab('roman')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'roman' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                        Romanized
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                        <button onClick={handleZoomOut} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
                        <span className="text-xs font-mono text-slate-300">|</span>
                        <button onClick={handleZoomIn} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
                        <span className="text-xs font-mono text-slate-300">|</span>
                        <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors" title="Print"><Printer className="w-5 h-5" /></button>
                         <span className="text-xs font-mono text-slate-300">|</span>
                         <button 
                            onClick={handleFavorite} 
                            className={`p-2 rounded-lg transition-colors ${isFav ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500'}`}
                            title={isFav ? "Saved to Favorites" : "Add to Favorites"}
                        >
                            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-xs font-mono text-slate-300">|</span>
                        <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors" title="Copy Text">
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
             )}

             {isEditing ? (
                 <div className="space-y-6">
                     <div>
                         <label className="block text-sm font-bold text-slate-500 mb-1">Nepali Lyrics</label>
                         <textarea className="w-full h-64 p-4 border rounded-xl font-sans bg-slate-50 focus:bg-white transition-colors" value={editForm.lyrics_nepali || ''} onChange={e => setEditForm({...editForm, lyrics_nepali: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-sm font-bold text-slate-500 mb-1">Romanized Lyrics</label>
                         <textarea className="w-full h-64 p-4 border rounded-xl font-sans bg-slate-50 focus:bg-white transition-colors" value={editForm.lyrics_roman || ''} onChange={e => setEditForm({...editForm, lyrics_roman: e.target.value})} />
                     </div>
                 </div>
             ) : (
                <div 
                    className="whitespace-pre-wrap font-sans leading-loose text-slate-800 tracking-wide lyrics-scroll"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                >
                    {activeTab === 'nepali' 
                        ? (data.lyrics_nepali || data.lyrics || "Lyrics available in Romanized version only.") 
                        : (data.lyrics_roman || "Romanized lyrics not available.")}
                </div>
             )}
         </div>

         {/* 3. Song Credits Card */}
         <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 no-print">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">Production Credits</h3>
            
            {isEditing ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label className="block text-sm font-bold text-slate-500 mb-1">Composer</label>
                         <input type="text" className="w-full border p-3 rounded-lg bg-slate-50" value={editForm.composer} onChange={e => setEditForm({...editForm, composer: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-sm font-bold text-slate-500 mb-1">Lyricist</label>
                         <input type="text" className="w-full border p-3 rounded-lg bg-slate-50" value={editForm.lyricist} onChange={e => setEditForm({...editForm, lyricist: e.target.value})} />
                     </div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="p-3 bg-white rounded-full shadow-sm text-indigo-500"><Music className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Composer</p>
                            {data.composer && data.composer !== "Unknown" ? (
                            <Link to={`/artist/${encodeURIComponent(data.composer)}`} className="text-slate-900 font-bold hover:text-primary transition-colors block">
                                {data.composer}
                            </Link>
                            ) : <span className="text-slate-400 text-sm italic">Unknown</span>}
                        </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="p-3 bg-white rounded-full shadow-sm text-purple-500"><PenTool className="w-5 h-5" /></div>
                        <div>
                             <p className="text-xs text-slate-400 font-bold uppercase mb-1">Lyrics By</p>
                            {data.lyricist && data.lyricist !== "Unknown" ? (
                            <Link to={`/artist/${encodeURIComponent(data.lyricist)}`} className="text-slate-900 font-bold hover:text-primary transition-colors block">
                                {data.lyricist}
                            </Link>
                            ) : <span className="text-slate-400 text-sm italic">Unknown</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* 4. More From Artist */}
         <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-[2px] rounded-3xl shadow-lg no-print group">
            <Link 
                to={`/artist/${encodeURIComponent(artist)}`}
                className="flex items-center justify-between w-full p-6 bg-white rounded-[22px] hover:bg-transparent hover:text-white transition-all duration-300"
            >
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mr-4 group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 group-hover:text-white/70 font-bold uppercase tracking-wider mb-1">More from</p>
                        <p className="text-lg font-bold text-slate-900 group-hover:text-white">{artist}</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </Link>
        </div>
        
        {/* Category Tags (Multiple) */}
        {displayCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 no-print">
                {displayCategories.map(cat => (
                    <div key={cat} className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                        <Tag className="w-4 h-4 mr-2 text-primary" /> 
                        <span className="text-primary">{cat}</span>
                    </div>
                ))}
            </div>
        )}

        {/* 5. Bottom Actions */}
        <div className="grid grid-cols-1 gap-4 no-print">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-around">
                 {socialLinks.map((link) => (
                    <a 
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110 shadow-sm ${link.color}`}
                        title={`Share on ${link.name}`}
                    >
                        {link.icon}
                    </a>
                ))}
                 <button onClick={() => setIsFeedbackOpen(true)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all" title="Report Issue">
                     <Flag className="w-5 h-5" />
                 </button>
            </div>
        </div>

      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Report Issue</h3>
                    <button onClick={() => setIsFeedbackOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {feedbackSubmitted ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Check className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-xl text-slate-800 mb-2">Thank You!</h4>
                        <p className="text-slate-500">Your feedback helps us improve.</p>
                    </div>
                ) : (
                    <form onSubmit={submitFeedback} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Issue Type</label>
                            <select 
                                value={feedbackType} 
                                onChange={(e) => setFeedbackType(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50"
                            >
                                <option value="lyrics">Wrong Lyrics</option>
                                <option value="credits">Wrong Credits</option>
                                <option value="typo">Typos / Formatting</option>
                                <option value="other">Other Suggestion</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Details</label>
                            <textarea 
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                rows={4} 
                                placeholder="Please describe the issue..."
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50"
                                required
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 transform active:scale-95"
                        >
                            Submit Report
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default LyricsPage;
