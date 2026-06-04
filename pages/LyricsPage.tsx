import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSongLyrics, getArtistDetails } from '../services/geminiService';
import { LyricsData, ArtistDetails, Category } from '../types';
import Loader from '../components/Loader';
import { 
  Heart, Music, PenTool, Copy, Check, ZoomIn, ZoomOut, 
  Flag, X, Edit, Save, Printer, Youtube, Mic2, StickyNote, 
  Globe, Search, Disc, Share2, ChevronRight, Loader2,
  Eye, EyeOff, Settings, ChevronDown, ChevronUp, Info, PlayCircle,
  Facebook, MessageCircle, Link as LinkIcon, Send, Play, ExternalLink,
  Volume2, Sparkles, RefreshCw, Trash2
} from 'lucide-react';
import { isFavorite, toggleFavorite, generateId } from '../utils/storage';
import { useAuth } from '../utils/auth';
import { 
  saveCustomSong, 
  incrementViewCount, 
  getAllCustomSongs, 
  getSongById, 
  submitReport,
  getAllCustomArtists,
  parseArtistIdentifier,
  getCategories,
  deleteCustomSong
} from '../utils/dataManager';
import { useLanguage } from '../contexts/LanguageContext';
import ArtistSelector from '../components/ArtistSelector';
import { convertToRoman } from '../utils/nepaliConverter';

const LyricsPage: React.FC = () => {
  const { id, artist: artistParam, song: songParam } = useParams<{ id?: string; artist?: string; song?: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<(LyricsData & { id?: any }) | null>(null);
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState<'nepali' | 'roman'>('nepali');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [relatedSongs, setRelatedSongs] = useState<any[]>([]);
  const { language: appLanguage, t } = useLanguage();
  
  const { user, isAuth: isAuthenticated } = useAuth();
  const canEdit = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editForm, setEditForm] = useState<LyricsData & { id?: any }>({
      title: '',
      title_nepali: '',
      artist: '',
      artists: [],
      composer: '',
      composers: [],
      lyricist: '',
      lyricists: [],
      singer: '',
      singers: [],
      categories: [],
      lyrics_nepali: '',
      lyrics_roman: '',
      youtubeUrl: '',
      isYoutubeVisible: true,
      note: '',
      isNoteVisible: true,
      language: 'nepali'
  });
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('Lyrics Issue');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      let lyricsResult = null;
      if (id) {
          lyricsResult = await getSongById(id);
      } else if (artistParam && songParam) {
          lyricsResult = await getSongLyrics(decodeURIComponent(artistParam), decodeURIComponent(songParam));
      }

      if (!lyricsResult) {
          setData(null);
          setLoading(false);
          return;
      }

      // AUTO-ROMANIZATION LOGIC: If Nepali exists but Roman is blank, fix it permanently.
      if (lyricsResult.lyrics_nepali && (!lyricsResult.lyrics_roman || lyricsResult.lyrics_roman.trim() === "")) {
          const autoRoman = convertToRoman(lyricsResult.lyrics_nepali);
          lyricsResult.lyrics_roman = autoRoman;
          // Background update to persist the missing Roman lyrics
          saveCustomSong(lyricsResult.artist, lyricsResult.title, { ...lyricsResult, lyrics_roman: autoRoman }).catch(console.error);
      }

      const songTitle = lyricsResult.title || songParam || '';
      const artistName = lyricsResult.artist || artistParam || '';

      document.title = `${songTitle} Lyrics | SansarPlus`;

      const [allSongs, artistsList, cats] = await Promise.all([
          getAllCustomSongs(),
          getAllCustomArtists(),
          getCategories()
      ]);

      setData(lyricsResult);
      setAllArtists(artistsList);
      setAvailableCategories(cats);

      // Explore More: Show random songs from different artists
      if (allSongs) {
          const randomRelated = allSongs
              .filter(s => s.id !== lyricsResult.id)
              .sort(() => 0.5 - Math.random()) // Random shuffle
              .slice(0, 5);
          setRelatedSongs(randomRelated);
      }

      setEditForm({ 
        ...lyricsResult,
        artists: lyricsResult.artists || [lyricsResult.artist],
        composers: lyricsResult.composers || (lyricsResult.composer ? [lyricsResult.composer] : []),
        lyricists: lyricsResult.lyricists || (lyricsResult.lyricist ? [lyricsResult.lyricist] : []),
        singers: lyricsResult.singers || (lyricsResult.singer ? [lyricsResult.singer] : []),
        categories: lyricsResult.categories || (lyricsResult.category ? [lyricsResult.category] : []),
        isYoutubeVisible: lyricsResult.isYoutubeVisible ?? true,
        isNoteVisible: lyricsResult.isNoteVisible ?? true
      });
      
      setIsFav(isFavorite(generateId('song', songTitle, artistName)));
      setLoading(false);
      incrementViewCount(artistName, songTitle);
    };

    fetchData();
  }, [id, artistParam, songParam]);

  const handleFavorite = () => {
    if (!data) return;
    const item = {
        id: generateId('song', data.title || '', data.artist || ''),
        dbId: data.id, // Store actual database ID for Short URL redirection from favorites
        type: 'song' as const,
        name: data.title || '',
        name_nepali: data.title_nepali, // Added to support localized favorites
        subtext: data.artist || '',
        language: data.language,
        note: data.note
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

  const shareToFB = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareToWA = () => {
    const text = `Check out the lyrics for "${appLanguage === 'nepali' ? data?.title_nepali || data?.title : data?.title}" on SansarPlus: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = async () => {
    if (!data) return;
    const shareData = {
      title: `${appLanguage === 'nepali' ? data.title_nepali || data.title : data.title} Lyrics`,
      text: `Check out the lyrics for "${appLanguage === 'nepali' ? data.title_nepali || data.title : data.title}" on SansarPlus!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Share failed", err);
    }
  };

  const handlePrint = () => window.print();
  const handleZoomIn = () => setFontSize(prev => Math.min(prev + 2, 72));
  const handleZoomOut = () => setFontSize(prev => Math.max(prev - 2, 10));

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSubmittingFeedback(true);
    try {
        await submitReport({
            type: feedbackType,
            text: feedbackText,
            song_id: data.id?.toString(),
            song_title: data.title,
            artist: data.artist
        });
        setFeedbackSubmitted(true);
        setTimeout(() => {
            setFeedbackSubmitted(false);
            setIsFeedbackOpen(false);
            setFeedbackText('');
        }, 2000);
    } catch (err: any) {
        alert("Submission failed.");
    } finally {
        setIsSubmittingFeedback(false);
    }
  };

  const handleSaveEdit = async () => {
      if (!data) return;
      try {
          setIsSaving(true);
          const cleanArtists = (editForm.artists || []).map(a => parseArtistIdentifier(a).name);
          const finalArtist = cleanArtists.length > 0 ? cleanArtists.join(', ') : (editForm.artist || data.artist);
          
          await saveCustomSong(finalArtist, editForm.title || data.title, {
              ...editForm,
              artist: finalArtist,
              composer: (editForm.composers || []).map(c => parseArtistIdentifier(c).name).join(', '),
              lyricist: (editForm.lyricists || []).map(l => parseArtistIdentifier(l).name).join(', '),
              singer: (editForm.singers || []).map(s => parseArtistIdentifier(s).name).join(', ')
          });
          
          setData({ ...data, ...editForm, artist: finalArtist });
          setIsEditing(false);
          alert("Song updated successfully!");
          
          if (editForm.title !== data.title || finalArtist !== data.artist) {
              window.location.reload();
          }
      } catch (err: any) {
          alert("Error: " + err.message);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteSong = async () => {
    if (!data) return;
    if (window.confirm(`Are you sure you want to delete "${data.title}"? This action cannot be undone.`)) {
      try {
        setIsSaving(true);
        await deleteCustomSong(data.artist || '', data.title || '');
        alert("Song deleted successfully.");
        navigate('/admin/dashboard');
      } catch (err: any) {
        alert("Failed to delete song: " + err.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getYouTubeEmbedUrl = (url?: string) => {
      if (!url) return null;
      let videoId = '';
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const renderContributorLinks = (names: string[] | string | undefined) => {
      if (!names) return null;
      const nameList = (Array.isArray(names) ? names : names.split(','))
        .map(s => parseArtistIdentifier(s.trim()).name)
        .filter(s => s && s.toLowerCase() !== 'unknown');
      
      if (nameList.length === 0) return null;
      
      return (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {nameList.map((name, i) => (
                  <React.Fragment key={name}>
                      <Link 
                        to={`/artist/${encodeURIComponent(name)}`} 
                        className="text-[17px] font-bold text-slate-700 hover:text-primary transition-all no-underline print:hidden"
                      >
                        {name}
                      </Link>
                      {i < nameList.length - 1 && <span className="text-slate-400 font-medium print:hidden">,</span>}
                  </React.Fragment>
              ))}
              {/* Visible during print as static text */}
              <div className="hidden print:block text-sm font-bold text-slate-800">
                {nameList.join(', ')}
              </div>
          </div>
      );
  };

  const handleEditLyricsChange = (val: string) => {
      setEditForm(prev => {
          const newState = { ...prev, lyrics_nepali: val };
          // Real-time Roman Nepali conversion if Romanized field is empty or manually reset
          if (!prev.lyrics_roman || prev.lyrics_roman.trim() === "") {
              newState.lyrics_roman = convertToRoman(val);
          }
          return newState;
      });
  };

  if (loading) return <Loader fullScreen text="Loading lyrics..." />;
  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <Disc className="w-20 h-20 text-slate-200 mb-4 animate-spin-slow" />
        <h2 className="text-2xl font-bold text-slate-400 mb-6">Lyrics not found</h2>
        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Back to Home</Link>
    </div>
  );

  const displayTitle = appLanguage === 'nepali' ? data.title_nepali || data.title : data.title;
  const embedUrl = getYouTubeEmbedUrl(data.youtubeUrl);
  const showAudioHub = data.isYoutubeVisible !== false && !!embedUrl;
  const hasSidebar = showAudioHub || relatedSongs.length > 0;

  const singersContent = renderContributorLinks(data.singers || data.singer);
  const composersContent = renderContributorLinks(data.composers || data.composer);
  const lyricistsContent = renderContributorLinks(data.lyricists || data.lyricist);
  const hasCredits = !!(singersContent || composersContent || lyricistsContent);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 selection:bg-primary/10 selection:text-primary">
      {/* Song Hero */}
      <div className="bg-white border-b border-slate-100 pt-4 md:pt-8 pb-2 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center space-y-0.5">
                {data.note && data.isNoteVisible !== false && (
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1 shadow-sm mb-1">
                        <StickyNote className="w-3 h-3" /> {data.note}
                    </span>
                )}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tighter drop-shadow-sm">{displayTitle}</h1>
                
                <div className="flex items-center justify-center gap-3 pt-2 print:hidden">
                    {canEdit && (
                        <button 
                          onClick={() => setIsEditing(!isEditing)} 
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all shadow-sm border font-black text-[9px] uppercase tracking-widest ${isEditing ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'}`}
                        >
                            {isEditing ? <><X className="w-3 h-3" /> Exit Editor</> : <><Edit className="w-3 h-3" /> Edit Metadata</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content: Lyrics & Credits */}
            <div className={`${hasSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-10`}>
                
                {isEditing ? (
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-200 space-y-10 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Settings className="w-6 h-6" /></div>
                          <h2 className="text-3xl font-black text-slate-800">Song Editor</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-3">Header Info</h3>
                              <div className="space-y-4">
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Roman Title</label>
                                      <input className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-bold" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nepali Title</label>
                                      <input className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-bold" value={editForm.title_nepali} onChange={e => setEditForm({...editForm, title_nepali: e.target.value})} placeholder="native text..." />
                                  </div>
                                  <ArtistSelector label="Main Artist(s)" selected={editForm.artists || []} onChange={arts => setEditForm({...editForm, artists: arts})} suggestions={allArtists} />
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-amber-500 pl-3">Settings</h3>
                              <div className="space-y-4">
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">YouTube URL</label>
                                      <input className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-bold" value={editForm.youtubeUrl} onChange={e => setEditForm({...editForm, youtubeUrl: e.target.value})} placeholder="https://..." />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Song Note</label>
                                      <input className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all font-bold" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} placeholder="e.g. (Chords Attached)" />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categories</label>
                                      <div className="flex flex-wrap gap-2 p-3 border-2 border-slate-100 rounded-2xl bg-slate-50">
                                          {availableCategories.map(cat => (
                                              <button 
                                                  key={cat.name}
                                                  type="button"
                                                  onClick={() => {
                                                      const exists = (editForm.categories || []).includes(cat.name);
                                                      setEditForm({
                                                          ...editForm,
                                                          categories: exists 
                                                              ? (editForm.categories || []).filter(c => c !== cat.name)
                                                              : [...(editForm.categories || []), cat.name]
                                                      });
                                                  }}
                                                  className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all ${ (editForm.categories || []).includes(cat.name) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}
                                              >
                                                  {cat.name}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pt-2">
                                      <button onClick={() => setEditForm({...editForm, isYoutubeVisible: !editForm.isYoutubeVisible})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest ${editForm.isYoutubeVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                          {editForm.isYoutubeVisible ? <><Eye className="w-3.5 h-3.5" /> Video On</> : <><EyeOff className="w-3.5 h-3.5" /> Video Off</>}
                                      </button>
                                      <button onClick={() => setEditForm({...editForm, isNoteVisible: !editForm.isNoteVisible})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest ${editForm.isNoteVisible ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                          {editForm.isNoteVisible ? <><Eye className="w-3.5 h-3.5" /> Note On</> : <><EyeOff className="w-3.5 h-3.5" /> Note Off</>}
                                      </button>
                                  </div>
                              </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Contributor Roles</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ArtistSelector label="Singers" selected={editForm.singers || []} onChange={v => setEditForm({...editForm, singers: v})} suggestions={allArtists} />
                            <ArtistSelector label="Composers" selected={editForm.composers || []} onChange={v => setEditForm({...editForm, composers: v})} suggestions={allArtists} />
                            <ArtistSelector label="Lyricists" selected={editForm.lyricists || []} onChange={v => setEditForm({...editForm, lyricists: v})} suggestions={allArtists} />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-l-4 border-slate-900 pl-3">
                              <div className="flex items-center gap-3">
                                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lyrics Body</h3>
                                  <span className="text-[9px] text-primary font-bold flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-full border border-primary/10 animate-pulse"><RefreshCw className="w-2.5 h-2.5"/> Auto-Romanizing Enabled</span>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nepali Script</label>
                                  <textarea className="w-full h-[600px] border-2 border-slate-100 p-6 rounded-[2.5rem] bg-slate-50 font-sans leading-relaxed outline-none focus:bg-white focus:border-primary transition-all shadow-inner" value={editForm.lyrics_nepali} onChange={e => handleEditLyricsChange(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex justify-between items-center ml-2">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Romanized</label>
                                      <button type="button" onClick={() => setEditForm(prev => ({...prev, lyrics_roman: convertToRoman(prev.lyrics_nepali || '')}))} className="text-[9px] font-black text-primary hover:underline uppercase flex items-center gap-1"><Sparkles className="w-2.5 h-2.5"/> Reset to Auto</button>
                                  </div>
                                  <textarea className="w-full h-[600px] border-2 border-slate-100 p-6 rounded-[2.5rem] bg-slate-50 font-sans leading-relaxed outline-none focus:bg-white focus:border-primary transition-all shadow-inner" value={editForm.lyrics_roman} onChange={e => setEditForm(prev => ({...prev, lyrics_roman: e.target.value}))} />
                              </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center transform active:scale-95">
                                {isSaving ? <Loader2 className="w-7 h-7 animate-spin mr-3"/> : <Save className="w-7 h-7 mr-3" />}
                                Publish Updates
                            </button>
                            <button onClick={handleDeleteSong} disabled={isSaving} className="px-8 bg-red-50 text-red-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border-2 border-red-100">
                                <Trash2 className="w-5 h-5 mr-2" /> Delete Song
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Interactive Lyrics Card (Only visible on screen) */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200 group/lyrics print:hidden">
                            <div className="flex flex-col md:flex-row border-b border-slate-100">
                                <div className="flex-1 flex bg-slate-50/50">
                                    <button onClick={() => setActiveTab('nepali')} className={`flex-1 py-5 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${activeTab === 'nepali' ? 'text-primary border-b-[4px] border-primary bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}>
                                        <Globe className="w-4 h-4 md:w-5 md:h-5" /> Nepali
                                    </button>
                                    <button onClick={() => setActiveTab('roman')} className={`flex-1 py-5 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${activeTab === 'roman' ? 'text-primary border-b-[4px] border-primary bg-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}>
                                        <Search className="w-4 h-4 md:w-5 md:h-5" /> Romanized
                                    </button>
                                </div>
                                <div className="p-2 md:p-3 bg-white flex items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100">
                                    <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
                                        <button onClick={handleZoomOut} className="p-2 text-slate-400 hover:text-primary"><ZoomOut className="w-4 h-4" /></button>
                                        <span className="text-[9px] font-black text-slate-300 mx-1">{fontSize}</span>
                                        <button onClick={handleZoomIn} className="p-2 text-slate-400 hover:text-primary"><ZoomIn className="w-4 h-4" /></button>
                                    </div>
                                    <button 
                                      onClick={handleFavorite} 
                                      className={`p-3 rounded-xl transition-all shadow-sm border ${isFav ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-slate-400 border-slate-200 hover:border-red-200 hover:text-red-400'}`}
                                      title="Favorite"
                                    >
                                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                                    </button>
                                    <button 
                                      onClick={handleCopy} 
                                      className={`p-3 rounded-xl transition-all shadow-sm border ${copied ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-slate-400 border-slate-200 hover:border-primary/30'}`}
                                      title="Copy"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-8 md:p-16 lg:p-20 relative bg-white min-h-[500px] flex flex-col items-center">
                                <div className="w-full max-w-2xl">
                                    <div 
                                        className="whitespace-pre-wrap leading-[2.4] transition-all font-medium text-slate-800 tracking-wider text-center selection:bg-primary/20" 
                                        style={{ fontSize: `${fontSize}px` }}
                                    >
                                        {activeTab === 'nepali' ? (data.lyrics_nepali || data.lyrics || "Native lyrics coming soon.") : (data.lyrics_roman || "Romanized lyrics coming soon.")}
                                    </div>
                                </div>

                                <div className="mt-20 pt-10 border-t border-slate-50 w-full flex flex-wrap justify-center gap-4">
                                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200 group">
                                        <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" /> Save PDF
                                    </button>
                                    <button onClick={() => setIsFeedbackOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-red-50/20 text-red-400 rounded-2xl font-bold text-xs hover:bg-red-50 transition-all border border-red-100/50 group">
                                        <Flag className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dedicated Print Section (Side-by-Side during PDF export) */}
                        <div className="hidden print:flex print:flex-row print:gap-10 pb-10 border-b border-slate-100 items-start">
                            <div className="print:w-1/2">
                                <h4 className="text-[10pt] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-1 text-center">Native Script (Nepali)</h4>
                                <div className="whitespace-pre-wrap leading-[1.6] text-[12pt] font-medium text-slate-950 text-center px-2">
                                    {data.lyrics_nepali || data.lyrics || "Native lyrics coming soon."}
                                </div>
                            </div>
                            <div className="print:w-1/2">
                                <h4 className="text-[10pt] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-1 text-center">Romanized Script</h4>
                                <div className="whitespace-pre-wrap leading-[1.6] text-[12pt] font-medium text-slate-950 text-center px-2">
                                    {data.lyrics_roman || "Romanized lyrics coming soon."}
                                </div>
                            </div>
                        </div>

                        {/* Credits Section (Improved Legibility) */}
                        {hasCredits && (
                            <div className="bg-slate-50/60 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 print:hidden">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Song Contributions</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                                    {singersContent && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200 pb-2 mb-3">
                                                <Mic2 className="w-3 h-3 text-primary" /> Vocalists
                                            </div>
                                            <div className="pl-1">{singersContent}</div>
                                        </div>
                                    )}
                                    {composersContent && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200 pb-2 mb-3">
                                                <Music className="w-3 h-3 text-indigo-500" /> Composition
                                            </div>
                                            <div className="pl-1">{composersContent}</div>
                                        </div>
                                    )}
                                    {lyricistsContent && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200 pb-2 mb-3">
                                                <PenTool className="w-3 h-3 text-emerald-500" /> Lyrics
                                            </div>
                                            <div className="pl-1">{lyricistsContent}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Print Footer Watermark (Visible only in PDF/Print) */}
                        <div className="hidden print:block pt-12 mt-8 border-t border-slate-100 text-center opacity-80">
                            <p className="text-xl font-black text-primary tracking-tighter">Download from SansarPlus.com</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">The Largest Nepali Christian Lyrics Platform</p>
                        </div>

                        {/* Share Section (Social sharing for Worship teams) */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-lg border border-slate-200 space-y-8 print:hidden">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">Share with Church</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Send to your worship team or church members</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button onClick={shareToFB} className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group border border-blue-100 shadow-sm active:scale-95">
                                    <Facebook className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                                </button>
                                <button onClick={shareToWA} className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all group border border-emerald-100 shadow-sm active:scale-95">
                                    <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                                </button>
                                <button onClick={handleShare} className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all group border border-indigo-100 shadow-sm active:scale-95">
                                    <Send className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Team Share</span>
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied!"); }} className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white transition-all group border border-slate-200 shadow-sm active:scale-95">
                                    <LinkIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Copy URL</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar (Always hidden during print) */}
            {hasSidebar && (
              <div className="lg:col-span-4 space-y-10 print:hidden">
                  <div className="sticky top-24 space-y-10">
                      
                      {/* Media Player */}
                      {showAudioHub && (
                          <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 ring-4 ring-white shadow-primary/5 group/player">
                              <div className="p-5 flex items-center justify-between border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                                          <Youtube className="w-5 h-5" />
                                      </div>
                                      <div>
                                          <h3 className="text-white text-sm font-black tracking-tight">Media Hub</h3>
                                          <div className="flex items-center gap-1.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Worship Session</p>
                                          </div>
                                      </div>
                                  </div>
                                  <a href={data.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white transition-colors" title="Open in YouTube">
                                      <ExternalLink className="w-4 h-4" />
                                  </a>
                              </div>
                              
                              <div className="aspect-video w-full bg-black relative">
                                  <iframe 
                                      className="absolute inset-0 w-full h-full"
                                      src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
                                      title="Official Media"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                  ></iframe>
                              </div>
                              
                              <div className="p-5 bg-gradient-to-t from-black to-slate-900 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-primary">
                                      <Volume2 className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em]">Now Reading</p>
                                      <p className="text-white text-xs font-bold truncate pr-2">{displayTitle}</p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Explore More Section - Shows Random Songs */}
                      {relatedSongs.length > 0 && (
                          <div className="space-y-6">
                              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-2 tracking-tighter">
                                   Explore More <ChevronRight className="w-6 h-6 text-primary" />
                              </h3>
                              <div className="space-y-3">
                                  {relatedSongs.map((song) => {
                                      const isArtistUnknown = song.artist?.toLowerCase() === 'unknown';
                                      return (
                                          <Link 
                                              key={song.id} 
                                              to={`/l/${song.id}`}
                                              className="flex items-center gap-4 p-4 bg-white rounded-[1.8rem] border border-slate-200 hover:border-primary/40 hover:shadow-xl transition-all group shadow-sm"
                                          >
                                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                                  <Play className="w-5 h-5 fill-current" />
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                  <p className="font-bold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                                                      {appLanguage === 'nepali' ? song.title_nepali || song.title : song.title}
                                                  </p>
                                                  {!isArtistUnknown && (
                                                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">
                                                          {song.artist}
                                                      </p>
                                                  )}
                                              </div>
                                          </Link>
                                      );
                                  })}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
            )}
        </div>

        {/* Feedback Modal (Hidden during print) */}
        {isFeedbackOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                    <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                        <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-6 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"><X className="w-6 h-6"/></button>
                        <h3 className="text-4xl font-black tracking-tighter relative z-10">Report Issue</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-3 relative z-10">Help Us Maintain Accuracy</p>
                    </div>
                    
                    {feedbackSubmitted ? (
                        <div className="p-16 text-center space-y-6">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-emerald-100"><Check className="w-12 h-12" /></div>
                            <h4 className="text-3xl font-black text-slate-900">Message Received</h4>
                            <p className="text-slate-500 font-medium">Thank you for helping the community!</p>
                        </div>
                    ) : (
                        <form onSubmit={submitFeedback} className="p-12 space-y-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Subject</label>
                                <select 
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-black text-sm outline-none focus:border-primary appearance-none cursor-pointer shadow-inner"
                                    value={feedbackType}
                                    onChange={(e) => setFeedbackType(e.target.value)}
                                >
                                    <option>Lyrics Issue</option>
                                    <option>Wrong Credits</option>
                                    <option>Broken Video</option>
                                    <option>Typo Error</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Details</label>
                                <textarea 
                                    required
                                    className="w-full h-40 bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] text-sm font-medium outline-none focus:bg-white focus:border-primary shadow-inner resize-none"
                                    placeholder="Explain the correction needed..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmittingFeedback}
                                className="w-full bg-slate-900 text-white py-6 rounded-[2.2rem] font-black text-lg shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
                            >
                                {isSubmittingFeedback ? 'Submitting...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default LyricsPage;